import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Sparkles, School, Phone, User, MessageSquare, MessageCircle, ExternalLink, Share2, Smartphone } from 'lucide-react';
import { Reservation } from '../types';
import { ACADEMY_INFO } from '../data/schools';
import { openKakaoConsultation, getDirectSmsUrl } from '../utils/kakaoShare';

interface QuickReservationCardProps {
  onReservationComplete: (reservation: Reservation) => void;
  onOpenAIChat: () => void;
  prefilledSchool?: string;
  prefilledGrade?: string;
  prefilledConcern?: string;
  showPrep2027?: boolean;
}

export const QuickReservationCard: React.FC<QuickReservationCardProps> = ({
  onReservationComplete,
  onOpenAIChat,
  prefilledSchool,
  prefilledGrade,
  prefilledConcern,
  showPrep2027 = true,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'ai'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState(prefilledSchool || '');
  const [grade, setGrade] = useState(() => {
    if (prefilledGrade) return prefilledGrade;
    return showPrep2027 ? '2027 예비고1 (현 중3)' : '고1';
  });
  const [isPrep2027Mode, setIsPrep2027Mode] = useState(showPrep2027);
  const [message, setMessage] = useState(() => {
    if (prefilledConcern) return prefilledConcern;
    return showPrep2027
      ? '2027 예비고1 고등영어 정밀 진단예약 신청합니다.'
      : '학교별 기출 분석 및 1:1 학습 진단 상담 신청합니다.';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openChatUrl, setOpenChatUrl] = useState(ACADEMY_INFO.kakaoChannelUrl);
  const [kakaoJsKey, setKakaoJsKey] = useState('');
  const [directorMobile, setDirectorMobile] = useState('010-2006-7525');
  const [methodCSent, setMethodCSent] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.kakaoOpenChatUrl) setOpenChatUrl(data.kakaoOpenChatUrl);
        if (data.kakaoJsKey) setKakaoJsKey(data.kakaoJsKey);
        if (data.directorMobile) setDirectorMobile(data.directorMobile);
      })
      .catch(() => {});
  }, []);

  // Sync prefilled values
  React.useEffect(() => {
    if (prefilledSchool) {
      setSchool(prefilledSchool);
    }
  }, [prefilledSchool]);

  React.useEffect(() => {
    if (prefilledGrade) {
      setGrade(prefilledGrade);
      if (prefilledGrade.includes('예비고1')) {
        setIsPrep2027Mode(true);
      }
    }
  }, [prefilledGrade]);

  React.useEffect(() => {
    if (prefilledConcern) {
      setMessage(prefilledConcern);
    }
  }, [prefilledConcern]);

  const handleOpenKakaoChat = () => {
    if (!submittedData) return;
    window.open(openChatUrl || ACADEMY_INFO.kakaoChannelUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('학생 또는 학부모 성함을 입력해 주세요.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError('연락처(휴대폰 번호)를 올바르게 입력해 주세요.');
      return;
    }

    if (!school) {
      setError('재학 중인 학교를 선택해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: name,
          parentPhone: phone,
          school: school,
          grade: grade,
          concerns: ['학교별 기출 정밀 진단 및 1:1 상담'],
          notes: message,
          preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          preferredTime: '18:00',
        }),
      });

      const data = await response.json();
      if (response.ok && data.reservation) {
        if (data.kakaoOpenChatUrl) {
          setOpenChatUrl(data.kakaoOpenChatUrl);
        }
        setSubmittedData(data.reservation);
        onReservationComplete(data.reservation);
      } else {
        setError(data.error || '예약 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="reservation-card"
      className="bg-white rounded-2xl border-2 border-[#122B49] shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6 flex flex-col justify-between"
    >
      {/* Header & Tabs */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-xl font-black text-[#122B49] tracking-tight">
            1:1 상담 예약
          </h3>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-white text-[#122B49] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              간편 신청
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                activeTab === 'ai'
                  ? 'bg-[#122B49] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>AI 실시간</span>
            </button>
          </div>
        </div>

        {submittedData ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-black text-emerald-950">
                상담 예약이 정상 접수되었습니다!
              </h4>
              <p className="text-xs text-emerald-800 mt-1 leading-relaxed break-keep-all">
                빅뱅영어학원 상담실장이 <strong>{submittedData.parentPhone}</strong> 번호로 일정 확인 및 시험지 지참 안내 연락을 드립니다.
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-emerald-200 text-left text-xs space-y-1 text-slate-700">
              <div className="flex items-center justify-between">
                <span>• 접수번호: <strong>{submittedData.id}</strong></span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  원장님 실시간 알림 완료
                </span>
              </div>
              <div>• 학생: {submittedData.studentName} ({submittedData.school} {submittedData.grade})</div>
              <div>• 안내: 방문 시 최근 영어 시험지나 풀던 교재를 지참해 주세요.</div>
            </div>

            {/* Direct Communication Action Section */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (!submittedData) return;
                  openKakaoConsultation(
                    {
                      id: submittedData.id,
                      studentName: submittedData.studentName,
                      parentPhone: submittedData.parentPhone,
                      school: submittedData.school,
                      grade: submittedData.grade,
                      preferredDate: submittedData.preferredDate,
                      preferredTime: submittedData.preferredTime,
                      concerns: submittedData.concerns,
                      notes: submittedData.notes,
                    },
                    openChatUrl
                  );
                  setMethodCSent(true);
                }}
                className="w-full py-3 px-3 bg-[#FEE500] hover:bg-[#fedb00] text-[#191919] font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4 fill-[#191919]" />
                <span>카카오톡 1:1 상담 바로 연결</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </button>

              {methodCSent && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-bold text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>예약 정보가 복사되었습니다. 카카오톡에서 편하게 문의해 주세요!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                <a
                  href={getDirectSmsUrl(submittedData, directorMobile)}
                  className="py-2.5 px-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 font-extrabold text-[11px] rounded-lg transition flex items-center justify-center gap-1 shadow-2xs"
                  title="010-2006-7525 원장님 직통 (내용 자동 입력)"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                  <span>문자 전송 (자동완성)</span>
                </a>
                <a
                  href="tel:032-471-7525"
                  className="py-2 px-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>전화 상담</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSubmittedData(null)}
              className="w-full bg-[#122B49] hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg transition cursor-pointer"
            >
              새로운 예약 신청하기
            </button>
          </div>
        ) : activeTab === 'ai' ? (
          /* AI Assistant Prompt inside Card */
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 bg-blue-100 text-[#122B49] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-6 h-6 text-blue-700 animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-[#122B49]">
                빅뱅 AI 상담실장 1:1 진단
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed break-keep-all">
                동인천고·숭덕여고·문일여고·만수북중·만수중·만수여중 5개년 기출 DB를 바탕으로 학생의 취약점을 실시간 분석해 드립니다.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenAIChat}
              className="w-full bg-[#122B49] hover:bg-[#1b3d68] text-white font-extrabold text-sm py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>실시간 AI 상담실장 대화창 열기</span>
            </button>
          </div>
        ) : (
          /* Form matching the reference image */
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-lg">
                {error}
              </div>
            )}

            {/* Quick 2027 Prep High School Switcher Button (Visible when campaign is active) */}
            {showPrep2027 && (
              <div className="bg-gradient-to-r from-amber-50 to-blue-50 border border-[#C59750] rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="bg-[#C59750] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0">
                    HOT
                  </span>
                  <div className="text-xs font-black text-[#122B49] truncate">
                    2027 예비고1 고등영어 진단
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGrade('2027 예비고1 (현 중3)');
                    setMessage('2027 예비고1 고등영어 정밀 진단예약 신청합니다.');
                    setIsPrep2027Mode(true);
                  }}
                  className={`text-[11px] font-black px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
                    grade.includes('예비고1')
                      ? 'bg-[#122B49] text-amber-300 shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-amber-100 border border-slate-300'
                  }`}
                >
                  {grade.includes('예비고1') ? '✓ 진단 선택됨' : '진단예약 선택'}
                </button>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                이름 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#122B49] focus:bg-white rounded-lg text-xs sm:text-sm transition focus:outline-hidden"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                전화번호 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="전화번호"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#122B49] focus:bg-white rounded-lg text-xs sm:text-sm transition focus:outline-hidden"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* School & Grade (Select dropdown matching reference) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  학교
                </label>
                <div className="relative">
                  <select
                    value={school}
                    required
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#122B49] focus:bg-white rounded-lg text-xs sm:text-sm transition focus:outline-hidden font-medium"
                  >
                    <option value="" disabled>재학 중인 학교 선택</option>
                    <option value="동인천고">동인천고</option>
                    <option value="숭덕여고">숭덕여고</option>
                    <option value="문일여고">문일여고</option>
                    <option value="만수고">만수고</option>
                    <option value="인제고">인제고</option>
                    <option value="신명여고">신명여고</option>
                    <option value="만수북중">만수북중</option>
                    <option value="만수중">만수중</option>
                    <option value="만수여중">만수여중</option>
                    <option value="간석여중">간석여중</option>
                    <option value="정각중">정각중</option>
                    <option value="만수동 인근 초/중/고">기타 학교</option>
                  </select>
                  <School className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  학년
                </label>
                <select
                  value={grade}
                  onChange={(e) => {
                    setGrade(e.target.value);
                    if (e.target.value.includes('예비고1')) {
                      setIsPrep2027Mode(true);
                    } else {
                      setIsPrep2027Mode(false);
                    }
                  }}
                  className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#122B49] focus:bg-white rounded-lg text-xs sm:text-sm transition focus:outline-hidden font-medium text-[#122B49] font-bold"
                >
                  {showPrep2027 && (
                    <option value="2027 예비고1 (현 중3)">🔥 2027 예비고1 (현 중3)</option>
                  )}
                  <option value="고1">고1</option>
                  <option value="고2">고2</option>
                  <option value="고3">고3</option>
                  <option value="중3">중3</option>
                  <option value="중2">중2</option>
                  <option value="중1">중1</option>
                  <option value="초등 고학년">초등부</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                상담 내용
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="상담 내용 (예: 서술형 영작 감점, 부교재 변형, 문법 기초 등)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#122B49] focus:bg-white rounded-lg text-xs sm:text-sm transition focus:outline-hidden resize-none"
                />
                <MessageSquare className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Warm Mustard / Caramel CTA Button matching the reference image */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#C59750] hover:bg-[#B58540] disabled:opacity-50 text-white font-extrabold text-sm sm:text-base py-3 rounded-xl transition shadow-md hover:shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <span>접수 처리 중...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>예약 신청</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Quick reassurance */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
        • 약 60분 무료 정밀 레벨테스트 및 원장 직강 성적표 분석 제공
      </div>
    </div>
  );
};
