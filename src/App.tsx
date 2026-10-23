import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SchoolCardGrid } from './components/SchoolCardGrid';
import { AcademyIntroSection } from './components/AcademyIntroSection';
import { ScoreImprovementSection } from './components/ScoreImprovementSection';
import { CurriculumRoadmapSection } from './components/CurriculumRoadmapSection';
import { QuickReservationCard } from './components/QuickReservationCard';
import { PrepHighSchool2027Section } from './components/PrepHighSchool2027Section';
import { SchoolDetailModal } from './components/SchoolDetailModal';
import { AIConsultationModal } from './components/AIConsultationModal';
import { ReservationModal } from './components/ReservationModal';
import { AdminReservationDrawer } from './components/AdminReservationDrawer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ChatMessage, ConsultationStage, Reservation, SchoolData } from './types';
import { TARGET_SCHOOLS, OTHER_SCHOOL_INFO, ACADEMY_INFO, isPrep2027Active } from './data/schools';
import { Sparkles, Phone, MapPin, Award, MessageCircle } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<ConsultationStage>(1);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | undefined>(undefined);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const chatRequestVersion = useRef(0);

  // View state: 'main' (Student/Parent landing page) vs 'admin' (Director management dashboard)
  const [currentView, setCurrentView] = useState<'main' | 'admin'>('main');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 2027 예비고1 특별 섹션 노출 상태 (2027년 4월 말일 이후 자동 만료, 또는 관리자 패널에서 제어)
  const [showPrep2027Campaign, setShowPrep2027Campaign] = useState<boolean>(() => isPrep2027Active());

  // Modals & Panels
  const [isAIChatModalOpen, setIsAIChatModalOpen] = useState(false);
  const [isSchoolDetailModalOpen, setIsSchoolDetailModalOpen] = useState(false);
  const [detailSchool, setDetailSchool] = useState<SchoolData | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationCount, setReservationCount] = useState<number>(3);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('bigbang_admin_auth') === 'true';
  });

  // Initialize consultation messages & load reservations from server
  useEffect(() => {
    const initialGreeting: ChatMessage = {
      id: 'msg-init',
      sender: 'ai',
      text: `안녕하세요! 인천 만수동 **빅뱅영어학원**의 **1차 상담 및 학습진단 전담 AI 상담실장**입니다. 😊\n\n저희 학원은 **동인천고·숭덕여고·문일여고·만수고·인제고·신명여고 / 만수북중·만수중·만수여중·간석여중·정각중** 5개년 기출 DB를 기반으로 학교별 서술형 감점 요인과 킬러 문항을 1:1로 정밀하게 진단합니다.\n\n학생의 **재학 중인 학교와 학년**, 그리고 현재 영어 공부에서 **가장 답답한 점**을 말씀해 주시면 맞춤 솔루션을 안내해 드립니다!`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      stage: 1,
      suggestedQuickReplies: [
        '동인천고 1학년입니다',
        '숭덕여고 2학년이에요',
        '문일여고 1학년입니다',
        '만수고 1학년입니다',
        '인제고 1학년입니다',
        '신명여고 2학년입니다',
        '만수북중 2학년입니다',
        '간석여중 2학년이에요',
        '정각중 2학년입니다',
      ],
    };
    setMessages([initialGreeting]);

    // Fetch initial reservations count & verify if admin session is preserved
    const savedPin = sessionStorage.getItem('bigbang_admin_pin') || '';
    const headers: Record<string, string> = {};
    if (savedPin) {
      headers['x-admin-pin'] = savedPin;
    }

    fetch('/api/reservations', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (typeof data.count === 'number') {
            setReservationCount(data.count);
          }
          if (data.authorized && Array.isArray(data.reservations)) {
            setReservations(data.reservations);
            setIsAdminAuthenticated(true);
          } else {
            setIsAdminAuthenticated(false);
          }
        }
      })
      .catch((err) => console.log('Reservation load error:', err));

    // Check season campaign setting
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isPrep2027Active === 'boolean') {
          setShowPrep2027Campaign(data.isPrep2027Active);
        }
      })
      .catch(() => {});
  }, []);

  // Main Chat Send Message Function
  const handleSendMessage = async (textToSend: string, overrideSchool?: SchoolData) => {
    const messageContent = textToSend.trim();
    if (!messageContent) return;

    // Detect the school on every message. A previous selection must not override a new one.
    const schoolInMessage = TARGET_SCHOOLS.find((school) =>
      messageContent.includes(school.badge) || messageContent.includes(school.name)
    );
    const otherSchoolInMessage = !schoolInMessage &&
      ['초등', '기타', '초등학교', '인근'].some((keyword) => messageContent.includes(keyword));
    const detectedSchool = overrideSchool || schoolInMessage ||
      (otherSchoolInMessage ? OTHER_SCHOOL_INFO : selectedSchool);
    const changingSchool = Boolean(selectedSchool && detectedSchool && selectedSchool.name !== detectedSchool.name);

    // Allow a school change even while a previous reply is pending, and discard that stale reply.
    if (isLoading && !changingSchool) return;
    const requestVersion = ++chatRequestVersion.current;

    const userTimestamp = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: userTimestamp,
    };

    setMessages((prev) => changingSchool ? [userMessage] : [...prev, userMessage]);
    setIsLoading(true);
    if (detectedSchool && detectedSchool.name !== selectedSchool?.name) {
      setSelectedSchool(detectedSchool);
    }
    if (changingSchool) {
      setCurrentStage(1);
      setSelectedGrade('');
      setSelectedConcerns([]);
    }

    // A new school also starts a new grade and conversation context.
    let detectedGrade = changingSchool ? '' : selectedGrade;
    if (!detectedGrade) {
      if (messageContent.includes('고1') || messageContent.includes('고등학교 1')) detectedGrade = '고1';
      else if (messageContent.includes('고2') || messageContent.includes('고등학교 2')) detectedGrade = '고2';
      else if (messageContent.includes('고3') || messageContent.includes('고등학교 3')) detectedGrade = '고3';
      else if (messageContent.includes('중1') || messageContent.includes('중학교 1')) detectedGrade = '중1';
      else if (messageContent.includes('중2') || messageContent.includes('중학교 2')) detectedGrade = '중2';
      else if (messageContent.includes('중3') || messageContent.includes('중학교 3')) detectedGrade = '중3';
      else if (messageContent.includes('초등')) detectedGrade = '초등';
      else {
        const yearMatch = messageContent.match(/([1-3])학년/);
        if (yearMatch && detectedSchool && detectedSchool !== OTHER_SCHOOL_INFO) {
          detectedGrade = `${detectedSchool.badge.includes('중') ? '중' : '고'}${yearMatch[1]}`;
        }
      }
      if (detectedGrade) setSelectedGrade(detectedGrade);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          messagesHistory: changingSchool ? [] : messages,
          school: detectedSchool?.name,
          grade: detectedGrade,
          concern: changingSchool ? '' : selectedConcerns.join(', '),
          stage: changingSchool ? 1 : currentStage,
        }),
      });

      const data = await response.json();
      if (requestVersion !== chatRequestVersion.current) return;
      const aiTimestamp = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const nextStage = (data.stage || (changingSchool ? 1 : currentStage)) as ConsultationStage;
      setCurrentStage(nextStage);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || '상담 내용을 정밀하게 분석 중입니다.',
        timestamp: aiTimestamp,
        stage: nextStage,
        suggestedQuickReplies: data.suggestedReplies || [],
        schoolData: detectedSchool,
        showReservationForm: nextStage >= 3,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      if (requestVersion !== chatRequestVersion.current) return;
      console.error('Chat error:', error);
      const fallbackAi: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `빅뱅영어학원에서는 **${detectedSchool?.name || '만수동 학교'}** 학생들을 위해 1:1 맞춤 정밀 레벨테스트(60분)를 상시 무료로 진행하고 있습니다.\n\n편하신 방문 일정을 남겨주시면 원장님 직접 상담으로 친절히 안내해 드리겠습니다!`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        stage: 4,
        showReservationForm: true,
        suggestedQuickReplies: ['무료 레벨테스트 예약하기', '학원 위치 및 전화 문의'],
      };
      setMessages((prev) => [...prev, fallbackAi]);
      setCurrentStage(4);
    } finally {
      if (requestVersion === chatRequestVersion.current) setIsLoading(false);
    }
  };

  // Reset Consultation
  const handleResetConsultation = () => {
    chatRequestVersion.current++;
    setIsLoading(false);
    setCurrentStage(1);
    setSelectedSchool(undefined);
    setSelectedGrade('');
    setSelectedConcerns([]);
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'ai',
        text: `새로운 상담을 시작합니다! 인천 만수동 **빅뱅영어학원** AI 상담실장입니다.\n\n학생의 **재학 중인 학교(동인천고·숭덕여고·문일여고 / 만수북중·만수중·만수여중 등)와 학년**을 알려주세요.`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        stage: 1,
        suggestedQuickReplies: [
          '동인천고 1학년',
          '숭덕여고 2학년',
          '문일여고 1학년',
          '만수북중 2학년',
          '만수여중 3학년',
          '만수중 2학년',
        ],
      },
    ]);
  };

  // When a reservation is completed
  const handleReservationCompleted = (newRes: Reservation) => {
    setReservationCount((prev) => prev + 1);
    if (isAdminAuthenticated) {
      setReservations((prev) => [newRes, ...prev]);
    }
    setCurrentStage(4);

    const confirmMessage: ChatMessage = {
      id: `ai-confirmed-${Date.now()}`,
      sender: 'ai',
      text: `🎉 **${newRes.studentName} 학생의 무료 레벨테스트 예약이 접수되었습니다!**\n\n- 예약 번호: ${newRes.id}\n- 학교/학년: ${newRes.school} ${newRes.grade}\n- 연락처: ${newRes.parentPhone}\n\n상담실장이 접수 확인 후 안내 문자를 발송해 드립니다. 시험지나 평소 풀던 교재를 지참해 주세요! 😊`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      stage: 4,
    };
    setMessages((prev) => [...prev, confirmMessage]);
  };

  const handleAdminLoginSuccess = (unlockedReservations: Reservation[], pin: string) => {
    sessionStorage.setItem('bigbang_admin_auth', 'true');
    sessionStorage.setItem('bigbang_admin_pin', pin);
    setIsAdminAuthenticated(true);
    setReservations(unlockedReservations);
    setReservationCount(unlockedReservations.length);
    setCurrentView('admin'); // Screen transitions to Admin Dashboard!
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('bigbang_admin_auth');
    sessionStorage.removeItem('bigbang_admin_pin');
    sessionStorage.removeItem('bb_admin_pin');
    setIsAdminAuthenticated(false);
    setReservations([]);
    setCurrentView('main'); // Return to homepage
  };

  const handleUpdateReservationStatus = async (id: string, newStatus: '접수완료' | '상담대기' | '확정') => {
    const pin = sessionStorage.getItem('bigbang_admin_pin') || '';
    try {
      const res = await fetch(`/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // When a user clicks a school card
  const handleOpenSchoolDetail = (school: SchoolData) => {
    setDetailSchool(school);
    setIsSchoolDetailModalOpen(true);
  };

  // When a user clicks a 2x2 chip tag in school card
  const handleSchoolTagClick = (school: SchoolData, tag: string) => {
    setIsAIChatModalOpen(true);
    handleSendMessage(`${school.name} ${tag} 내용과 맞춤 대비 전략을 알려주세요.`, school);
  };

  // When a user clicks 2027 Prep High School CTA
  const handleOpenPrepReservation = (preset?: { grade?: string; concern?: string; school?: string }) => {
    const targetGrade = preset?.grade || '2027 예비고1 (현 중3)';
    setSelectedGrade(targetGrade);
    if (preset?.concern) {
      setSelectedConcerns([preset.concern]);
    } else {
      setSelectedConcerns(['2027 예비고1 고등영어 진단예약']);
    }
    setIsReservationModalOpen(true);
  };

  const handleOpenAIChatWithPrompt = (promptText?: string) => {
    setIsAIChatModalOpen(true);
    if (promptText) {
      handleSendMessage(promptText);
    }
  };

  // Smooth scroll helper
  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-blueprint-grid text-slate-900 font-sans flex flex-col selection:bg-[#C59750] selection:text-white">
      {/* Top Navigation Bar */}
      <Header
        onOpenReservations={() => {
          if (isAdminAuthenticated) {
            setCurrentView('admin');
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        onOpenAIChat={() => setIsAIChatModalOpen(true)}
        reservationCount={reservationCount}
        isAdminAuthenticated={isAdminAuthenticated}
        onNavigateSection={(sectionId) => {
          if (currentView !== 'main') {
            setCurrentView('main');
            setTimeout(() => handleNavigateSection(sectionId), 50);
          } else {
            handleNavigateSection(sectionId);
          }
        }}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onSwitchToAdminView={() => setCurrentView('admin')}
        currentView={currentView}
      />

      {/* Screen Transition: Full Admin Dashboard View vs Public Student/Parent Landing Page */}
      {currentView === 'admin' ? (
        <AdminDashboardView
          reservations={reservations}
          reservationCount={reservationCount}
          onLogout={handleAdminLogout}
          onBackToMain={() => setCurrentView('main')}
          onUpdateStatus={handleUpdateReservationStatus}
          showPrep2027Campaign={showPrep2027Campaign}
          onTogglePrep2027Campaign={setShowPrep2027Campaign}
        />
      ) : (
        <>
          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-8 sm:space-y-12">
            {/* 1. Hero Section matching reference image with 2027 diagnosis highlight */}
            <HeroSection
              onOpenReservationModal={() => setIsReservationModalOpen(true)}
              onOpenAIChat={() => setIsAIChatModalOpen(true)}
              onOpenPrepReservation={() => handleOpenPrepReservation()}
              showPrep2027={showPrep2027Campaign}
            />

            {/* 2. Special Intake: 2027 예비고1 고등영어 진단예약 Section (2027년 4월 말일 이후 자동 숨김) */}
            {showPrep2027Campaign && (
              <PrepHighSchool2027Section
                onOpenReservation={handleOpenPrepReservation}
                onOpenAIChat={handleOpenAIChatWithPrompt}
              />
            )}

            {/* 3. Target Schools Grid Section with High/Middle tracks */}
            <SchoolCardGrid
              onSelectSchool={handleOpenSchoolDetail}
              onTagClick={handleSchoolTagClick}
            />

            {/* 4. Academy Introduction Section (Philosophy, 4-Step System, Facilities & Map) */}
            <AcademyIntroSection
              onOpenAIChat={() => setIsAIChatModalOpen(true)}
              onOpenReservation={() => setIsReservationModalOpen(true)}
            />

            {/* 5. Lower Split Section (Score Improvement & Curriculum vs 1:1 Reservation Card) */}
            <section id="results-and-reservation" className="w-full py-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 7 Columns: 성적 향상 증명 + 커리큘럼 로드맵 */}
                <div className="lg:col-span-7 space-y-8">
                  <ScoreImprovementSection />
                  <CurriculumRoadmapSection />
                </div>

                {/* Right 5 Columns: 1:1 상담 예약 Card matching reference image */}
                <div className="lg:col-span-5 sticky top-24">
                  <QuickReservationCard
                    onReservationComplete={handleReservationCompleted}
                    onOpenAIChat={() => setIsAIChatModalOpen(true)}
                    prefilledSchool={selectedSchool?.badge}
                    prefilledGrade={selectedGrade}
                    prefilledConcern={selectedConcerns.length > 0 ? selectedConcerns[0] : undefined}
                    showPrep2027={showPrep2027Campaign}
                  />
                </div>
              </div>
            </section>
          </main>

          {/* Footer matching reference image */}
          <footer className="w-full bg-white border-t-2 border-[#122B49] mt-12 py-8 text-xs text-slate-600">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-black text-[#122B49]">
                  <span>BIGBANG ENGLISH ACADEMY</span>
                  <span>•</span>
                  <span>빅뱅영어학원</span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C59750]" />
                    {ACADEMY_INFO.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#C59750]" />
                    전화: {ACADEMY_INFO.phone}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  대상 학교: 동인천고, 숭덕여고, 문일여고, 만수고, 인제고, 신명여고, 만수북중, 만수중, 만수여중, 간석여중, 정각중 및 만수동 일대 초·중·고
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
                <a
                  href={ACADEMY_INFO.kakaoChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#371D1E] bg-[#FEE500] px-2.5 py-1 rounded-md hover:bg-[#fedb00] transition flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-[#371D1E]" />
                  <span>카카오톡 1:1 상담</span>
                </a>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setIsAIChatModalOpen(true)}
                  className="text-xs font-bold text-[#122B49] hover:underline cursor-pointer"
                >
                  AI 상담실장
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => {
                    if (isAdminAuthenticated) {
                      setCurrentView('admin');
                    } else {
                      setIsLoginModalOpen(true);
                    }
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-slate-950 cursor-pointer flex items-center gap-1.5"
                >
                  <span>상담 접수 관리</span>
                  <span className="bg-[#122B49] text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
                    {reservationCount}
                  </span>
                </button>
                <span>|</span>
                <span className="text-slate-400">© 2026 빅뱅영어학원 All Rights Reserved.</span>
              </div>
            </div>
          </footer>

          {/* Floating AI Consultation Trigger at bottom-right */}
          <div className="fixed bottom-5 right-5 z-40">
            <button
              type="button"
              onClick={() => setIsAIChatModalOpen(true)}
              className="bg-[#122B49] hover:bg-[#1b3e69] text-white font-extrabold text-xs sm:text-sm px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 cursor-pointer border-2 border-white/20 active:scale-95 group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <Sparkles className="w-4 h-4 text-[#C59750] group-hover:rotate-12 transition-transform" />
              <span>AI 상담실장 1:1 진단 (실시간)</span>
            </button>
          </div>
        </>
      )}

      {/* Interactive Modals */}
      {/* 1. Full Real-time AI Consultation Modal */}
      <AIConsultationModal
        isOpen={isAIChatModalOpen}
        onClose={() => setIsAIChatModalOpen(false)}
        messages={messages}
        isLoading={isLoading}
        currentStage={currentStage}
        selectedSchool={selectedSchool}
        selectedGrade={selectedGrade}
        selectedConcerns={selectedConcerns}
        onSendMessage={(text) => handleSendMessage(text)}
        onSelectSchool={(school) => {
          handleSendMessage(`${school.name} 학생입니다. 우리 학교 내신 출제 경향과 맞춤 대비 솔루션이 궁금해요.`, school);
        }}
        onSelectConcern={(concern) => {
          setSelectedConcerns((prev) => [...prev, concern]);
          handleSendMessage(`가장 큰 영어 고민은 '${concern}' 입니다.`);
        }}
        onReset={handleResetConsultation}
        onOpenReservationModal={() => setIsReservationModalOpen(true)}
      />

      {/* 2. School In-Depth Breakdown Modal */}
      <SchoolDetailModal
        school={detailSchool}
        onClose={() => {
          setIsSchoolDetailModalOpen(false);
          setDetailSchool(null);
        }}
        onStartConsultation={(school) => {
          setIsAIChatModalOpen(true);
          handleSendMessage(`${school.name}의 킬러 문항과 서술형 대비 전략에 대해 자세히 상담받고 싶어요.`, school);
        }}
        onBookTest={(school) => {
          setSelectedSchool(school);
          setIsReservationModalOpen(true);
        }}
      />

      {/* 3. Comprehensive Level Test Booking Modal */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        defaultSchool={selectedSchool}
        defaultGrade={selectedGrade}
        defaultConcerns={selectedConcerns}
        onReservationComplete={handleReservationCompleted}
        showPrep2027={showPrep2027Campaign}
      />

      {/* 4. Admin Reservations Drawer */}
      <AdminReservationDrawer
        isOpen={isAdminDrawerOpen}
        onClose={() => setIsAdminDrawerOpen(false)}
        reservations={reservations}
        reservationCount={reservationCount}
        isAdminAuthenticated={isAdminAuthenticated}
        onLoginSuccess={handleAdminLoginSuccess}
        onLogout={handleAdminLogout}
        onUpdateStatus={handleUpdateReservationStatus}
        showPrep2027Campaign={showPrep2027Campaign}
        onTogglePrep2027Campaign={setShowPrep2027Campaign}
      />

      {/* 5. Direct Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
