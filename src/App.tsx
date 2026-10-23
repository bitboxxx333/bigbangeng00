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

type GuidedReply = { text: string; stage: ConsultationStage; suggestedReplies: string[] };

function buildGuidedReply(message: string, school: SchoolData | undefined, grade: string, concern: string, stage: ConsultationStage): GuidedReply {
  if (!school) {
    return {
      stage: 1,
      text: (message.includes('예비고1') || message.includes('2027')
        ? '2027 예비고1 진단은 현재 중3 학생을 위한 안내입니다. '
        : '') + '먼저 학생의 재학 학교를 알려주세요. 학교와 학년을 확인한 뒤 고민과 방문 상담 순서로 안내하겠습니다.',
      suggestedReplies: ['동인천고 1학년입니다', '숭덕여고 2학년이에요', '정각중 2학년입니다'],
    };
  }
  if (!grade) {
    return {
      stage: 1,
      text: school.badge + ' 학생이시군요. 현재 학년을 알려주시면 다음으로 가장 고민되는 영어 영역을 여쭙겠습니다.',
      suggestedReplies: school.type === 'middle' ? ['중1입니다', '중2입니다', '중3입니다'] : ['고1입니다', '고2입니다', '고3입니다'],
    };
  }
  if (!concern && stage <= 2) {
    return {
      stage: 2,
      text: school.badge + ' ' + grade + ' 학생으로 확인했습니다. 가장 고민되는 영역은 무엇인가요? 한 가지를 골라주시면 학교별 안내 자료를 바탕으로 준비 방향을 설명드리겠습니다.',
      suggestedReplies: ['내신 서술형 영작 감점이 심해요', '문법 기초 개념 부족', '어휘력 부족 & 암기 취약', '독해 속도 및 시간 부족', '모의고사/부교재 변형 대비'],
    };
  }
  if (stage >= 3 && /예약|방문|일정|신청|시간|전화|카카오|위치/.test(message)) {
    return {
      stage: 4,
      text: '무료 레벨테스트와 방문 상담을 원하시는군요. 날짜와 시간을 함께 조율하겠습니다. 다만 현재 온라인 예약 접수 서버는 연결되지 않아 이 대화만으로 예약이 확정되지 않습니다. 예약 양식의 전화 또는 카카오톡 문의로 학원에 직접 연락해 주세요. 상담 전화: 032-471-7525.',
      suggestedReplies: ['학원 위치 및 전화 문의', '학교별 준비 방향 다시 알려주세요'],
    };
  }
  const focus = school.targetFocus;
  const advice = /서술형|영작/.test(concern)
    ? '조건에 표시된 시제·수일치·어형 변화를 답안별로 점검하고, 실제 감점 항목은 최근 시험지와 함께 확인하는 것이 좋습니다.'
    : /문법/.test(concern)
    ? '헷갈리는 문법 개념을 문장 속 근거와 연결해 보고, 틀린 문항의 이유를 설명하는 연습부터 시작해 보세요.'
    : /어휘|단어/.test(concern)
    ? '빈출 어휘를 문맥·유의어·반의어와 묶어서 복습하고, 암기 후 문장 적용까지 확인해 보세요.'
    : /독해|시간/.test(concern)
    ? '문장 구조를 먼저 파악한 뒤 제한 시간을 두고 지문을 읽으며 병목 구간을 확인해 보세요.'
    : '최근 시험지와 학습 자료를 대조해 어려웠던 유형을 먼저 확인하는 것이 좋습니다.';
  return {
    stage: 3,
    text: school.badge + ' ' + grade + ' 학생의 고민을 ' + concern + '(으)로 이해했습니다. 학원에 게시된 학교별 대비 초점은 "' + focus + '"입니다.\n\n' + advice + '\n\n이 내용은 단계별 상담 안내이며, 실제 시험지 분석이나 개인 진단이 완료된 것은 아닙니다. 무료 레벨테스트와 방문 상담을 원하시면 알려주세요.',
    suggestedReplies: ['무료 레벨테스트 방문 상담 방법', '학원 위치 및 전화 문의'],
  };
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [guidedMode, setGuidedMode] = useState(false);
  const [reportReady, setReportReady] = useState(false);
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
  const [reservationCount, setReservationCount] = useState<number>(0);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('bigbang_admin_auth') === 'true';
  });

  // Initialize consultation messages & load reservations from server
  useEffect(() => {
    const initialGreeting: ChatMessage = {
      id: 'msg-init',
      sender: 'ai',
      text: '안녕하세요. 빅뱅영어학원 단계별 상담 안내입니다. 재학 학교와 학년을 알려주시면 학습 고민을 듣고 준비 방향과 방문 상담 방법을 차례로 안내하겠습니다. 실제 개인 진단은 방문 상담과 시험지 확인 후 진행됩니다.',
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
      .catch((err) => {
        console.log('Reservation load error:', err);
        setIsAdminAuthenticated(false);
      });

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

  // The deployed static site can continue the scripted four-step guide when /api/chat is unavailable.
  const handleSendMessage = async (textToSend: string, overrideSchool?: SchoolData) => {
    const messageContent = textToSend.trim();
    if (!messageContent) return;
    const schoolInMessage = TARGET_SCHOOLS.find((school) =>
      messageContent.includes(school.badge) || messageContent.includes(school.name)
    );
    const otherSchoolInMessage = !schoolInMessage &&
      ['초등', '기타', '초등학교', '인근'].some((keyword) => messageContent.includes(keyword));
    const isPrepInquiry = /예비고1|2027/.test(messageContent) && !schoolInMessage && !overrideSchool;
    const detectedSchool = overrideSchool || schoolInMessage ||
      (otherSchoolInMessage ? OTHER_SCHOOL_INFO : isPrepInquiry ? undefined : selectedSchool);
    const changingSchool = Boolean(selectedSchool &&
      (isPrepInquiry || (detectedSchool && selectedSchool.name !== detectedSchool.name)));
    if (isLoading && !changingSchool) return;
    const requestVersion = ++chatRequestVersion.current;
    const timestamp = () => new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: 'usr-' + Date.now(), sender: 'user', text: messageContent, timestamp: timestamp(),
    };
    setMessages((prev) => changingSchool ? [userMessage] : [...prev, userMessage]);
    setIsLoading(true);
    if (changingSchool) {
      setCurrentStage(1);
      setSelectedConcerns([]);
      setReportReady(false);
    }
    if (isPrepInquiry) setSelectedSchool(undefined);
    else if (detectedSchool?.name !== selectedSchool?.name) setSelectedSchool(detectedSchool);

    let detectedGrade = isPrepInquiry ? '2027 예비고1 (현 중3)' : changingSchool ? '' : selectedGrade;
    if (!detectedGrade) {
      if (/고1|고등학교 1/.test(messageContent)) detectedGrade = '고1';
      else if (/고2|고등학교 2/.test(messageContent)) detectedGrade = '고2';
      else if (/고3|고등학교 3/.test(messageContent)) detectedGrade = '고3';
      else if (/중1|중학교 1/.test(messageContent)) detectedGrade = '중1';
      else if (/중2|중학교 2/.test(messageContent)) detectedGrade = '중2';
      else if (/중3|중학교 3/.test(messageContent)) detectedGrade = '중3';
      else if (messageContent.includes('초등')) detectedGrade = '초등';
      else {
        const yearMatch = messageContent.match(/([1-3])학년/);
        if (yearMatch && detectedSchool && detectedSchool !== OTHER_SCHOOL_INFO) {
          detectedGrade = (detectedSchool.type === 'middle' ? '중' : '고') + yearMatch[1];
        }
      }
    }
    if (detectedGrade !== selectedGrade) setSelectedGrade(detectedGrade);
    const effectiveStage = changingSchool ? 1 : currentStage;
    const concernFromMessage = effectiveStage >= 2 && /서술형|영작|문법|어휘|단어|독해|모의고사|부교재|시험 시간/.test(messageContent)
      ? messageContent.replace(/^가장 큰 영어 고민은 ['"]?|['"]? 입니다\.?$/g, '').slice(0, 90) : '';
    const concern = changingSchool || isPrepInquiry ? '' : concernFromMessage || selectedConcerns[0] || '';
    if (concernFromMessage && !changingSchool) setSelectedConcerns((prev) => prev.includes(concernFromMessage) ? prev : [concernFromMessage]);

    const appendGuidedReply = () => {
      const reply = buildGuidedReply(messageContent, detectedSchool, detectedGrade, concern, effectiveStage);
      setCurrentStage(reply.stage);
      setMessages((prev) => [...prev, {
        id: 'guide-' + Date.now(), sender: 'ai', text: reply.text, timestamp: timestamp(),
        stage: reply.stage, suggestedQuickReplies: reply.suggestedReplies,
        schoolData: detectedSchool, showReservationForm: reply.stage >= 3,
      }]);
    };
    if (guidedMode) {
      appendGuidedReply();
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent, messagesHistory: changingSchool ? [] : messages,
          school: detectedSchool?.name, grade: detectedGrade, concern,
          stage: effectiveStage,
        }),
      });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Chat API unavailable');
      }
      const data = await response.json();
      if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('Invalid chat response');
      if (requestVersion !== chatRequestVersion.current) return;
      const nextStage = (data.stage || effectiveStage) as ConsultationStage;
      setCurrentStage(nextStage);
      setReportReady(data.diagnosticComplete === true);
      setMessages((prev) => [...prev, {
        id: 'ai-' + Date.now(), sender: 'ai', text: data.text, timestamp: timestamp(),
        stage: nextStage, suggestedQuickReplies: data.suggestedReplies || [],
        schoolData: detectedSchool, showReservationForm: nextStage >= 3,
      }]);
    } catch (error) {
      if (requestVersion !== chatRequestVersion.current) return;
      console.error('Chat API unavailable, continuing guided consultation:', error);
      setGuidedMode(true);
      setReportReady(false);
      appendGuidedReply();
    } finally {
      if (requestVersion === chatRequestVersion.current) setIsLoading(false);
    }
  };

  // Reset Consultation
  const handleResetConsultation = () => {
    chatRequestVersion.current++;
    setIsLoading(false);
    setGuidedMode(false);
    setReportReady(false);
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
      text: `🎉 **${newRes.studentName} 학생의 무료 레벨테스트 예약이 접수되었습니다!**\n\n- 예약 번호: ${newRes.id}\n- 학교/학년: ${newRes.school} ${newRes.grade}\n- 연락처: ${newRes.parentPhone}\n\n상담실장이 접수 확인 후 방문 일정을 안내해 드릴 예정입니다. 시험지나 평소 풀던 교재를 지참해 주세요! 😊`,
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
    // This campaign is for current middle-school third graders, not the previous chat student.
    setSelectedSchool(preset?.school ? TARGET_SCHOOLS.find((school) => school.name === preset.school || school.badge === preset.school) : undefined);
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
              <span>AI 상담실장 단계별 상담</span>
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
        guidedMode={guidedMode}
        reportReady={reportReady}
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
