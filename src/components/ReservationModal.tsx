import React, { useState, useEffect } from 'react';
import { TARGET_SCHOOLS, COMMON_CONCERNS, ACADEMY_INFO } from '../data/schools';
import { Reservation, SchoolData } from '../types';
import { openKakaoConsultation, getDirectSmsUrl, formatReservationText } from '../utils/kakaoShare';
import { 
  X, 
  CalendarCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  School, 
  Sparkles, 
  Copy, 
  Check, 
  MessageCircle, 
  ExternalLink, 
  Send,
  Share2,
  Smartphone
} from 'lucide-react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSchool?: SchoolData;
  defaultGrade?: string;
  defaultConcerns?: string[];
  onReservationComplete: (res: Reservation) => void;
  showPrep2027?: boolean;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  defaultSchool,
  defaultGrade,
  defaultConcerns = [],
  onReservationComplete,
  showPrep2027 = true,
}) => {
  if (!isOpen) return null;

  const [studentName, setStudentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(defaultSchool?.name || '');
  const [selectedGrade, setSelectedGrade] = useState(defaultGrade || '');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    defaultConcerns.length > 0 ? defaultConcerns : [COMMON_CONCERNS[0].label]
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [apiAvailable, setApiAvailable] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [kakaoOpenChatUrl, setKakaoOpenChatUrl] = useState(ACADEMY_INFO.kakaoChannelUrl);
  const [kakaoJsKey, setKakaoJsKey] = useState('');
  const [directorMobile, setDirectorMobile] = useState('010-2006-7525');
  const [methodCSent, setMethodCSent] = useState(false);

  useEffect(() => {
    fetch('/api/reservations')
      .then(async (res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return false;
        const data = await res.json();
        return typeof data.count === 'number';
      })
      .then(setApiAvailable)
      .catch(() => setApiAvailable(false));
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.kakaoOpenChatUrl) setKakaoOpenChatUrl(data.kakaoOpenChatUrl);
        if (data.kakaoJsKey) setKakaoJsKey(data.kakaoJsKey);
        if (data.directorMobile) setDirectorMobile(data.directorMobile);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedGrade(defaultGrade || '');
    setSelectedSchool(defaultSchool?.name || '');
    setSelectedConcerns(defaultConcerns || []);
    setSubmitError('');
  }, [defaultGrade, defaultSchool, defaultConcerns, isOpen]);

  const toggleConcern = (label: string) => {
    if (selectedConcerns.includes(label)) {
      setSelectedConcerns(selectedConcerns.filter((c) => c !== label));
    } else {
      setSelectedConcerns([...selectedConcerns, label]);
    }
  };

  // Handle Kakao Direct Open (Zero-error, opens KakaoTalk app directly)
  const handleOpenKakaoDirect = () => {
    if (!confirmedReservation) return;
    openKakaoConsultation(
      {
        id: confirmedReservation.id,
        studentName: confirmedReservation.studentName,
        parentPhone: confirmedReservation.parentPhone,
        school: confirmedReservation.school,
        grade: confirmedReservation.grade,
        preferredDate: confirmedReservation.preferredDate,
        preferredTime: confirmedReservation.preferredTime,
        concerns: confirmedReservation.concerns,
        notes: confirmedReservation.notes,
      },
      kakaoOpenChatUrl
    );
    setMethodCSent(true);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !parentPhone.trim() || !selectedSchool || !selectedGrade || !preferredDate || !preferredTime) {
      setSubmitError('필수 항목을 모두 선택해 주세요.');
      return;
    }
    const schoolType = TARGET_SCHOOLS.find((school) => school.name === selectedSchool)?.type;
    if ((selectedGrade.includes('예비고1') || selectedGrade.startsWith('중')) && schoolType === 'high') {
      setSubmitError('현재 학년과 재학 학교가 맞지 않습니다. 재학 학교를 다시 선택해 주세요.');
      return;
    }

    if (!apiAvailable) {
      setSubmitError('온라인 접수 서비스가 연결되지 않았습니다. 전화 또는 카카오톡으로 문의해 주세요.');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: studentName.trim(),
          parentPhone: parentPhone.trim(),
          school: selectedSchool,
          grade: selectedGrade,
          concerns: selectedConcerns,
          preferredDate,
          preferredTime,
          notes: notes.trim(),
        }),
      });

      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Reservation API unavailable');
      }
      const data = await response.json();
      if (!data.reservation?.id) {
        throw new Error('Reservation was not confirmed by the server');
      }
      if (data.kakaoOpenChatUrl) setKakaoOpenChatUrl(data.kakaoOpenChatUrl);
      setConfirmedReservation(data.reservation);
      onReservationComplete(data.reservation);
    } catch (err) {
      console.error('Reservation submission failed:', err);
      setSubmitError('온라인 접수가 확인되지 않았습니다. 예약은 완료되지 않았습니다. 아래 전화 또는 카카오톡으로 문의해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (!confirmedReservation) return;
    const summary = `[빅뱅영어학원 무료 레벨테스트 예약확인]\n- 예약번호: ${confirmedReservation.id}\n- 학생: ${confirmedReservation.studentName} (${confirmedReservation.school} ${confirmedReservation.grade})\n- 예약일시: ${confirmedReservation.preferredDate} ${confirmedReservation.preferredTime}\n- 학원위치: ${ACADEMY_INFO.location}\n- 문의: ${ACADEMY_INFO.phone}\n*최근 영어 시험지나 문제집을 지참하시면 더욱 정밀한 상담이 가능합니다.`;
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#0B1E3B] text-white p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-[#162D50]">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="p-2 bg-[#0F2A4A] rounded-xl border border-blue-800 shrink-0 mt-0.5">
              <CalendarCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm sm:text-base text-white leading-snug break-keep-all">
                빅뱅영어학원 무료 레벨테스트 & 1:1 학습 컨설팅 예약
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 break-keep-all leading-normal">
                만수동 6개교 기출 기반 정밀 진단 성적표 무료 발급 (약 60분 소요)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {confirmedReservation ? (
            /* Confirmation Receipt View */
            <div className="space-y-4">
              <div className="text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-emerald-950 text-base">
                  무료 레벨테스트 예약이 성공적으로 접수되었습니다!
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  학원에서 접수 내역과 방문 희망일시를 확인한 뒤 연락드립니다.
                </p>
              </div>

              {/* Receipt Ticket */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      CONSULTATION TICKET
                    </span>
                    <p className="text-xs font-bold text-slate-900">
                      예약 번호: {confirmedReservation.id}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {confirmedReservation.status}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-slate-200 divide-y divide-slate-100 text-xs mb-3">
                  <div className="flex items-center justify-between py-1.5 first:pt-0">
                    <span className="text-slate-500 text-[11px]">학생 정보</span>
                    <span className="font-bold text-slate-900">
                      {confirmedReservation.studentName} ({confirmedReservation.school} {confirmedReservation.grade})
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500 text-[11px]">학부모 연락처</span>
                    <span className="font-bold text-slate-900">{confirmedReservation.parentPhone}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500 text-[11px]">방문 희망 일시</span>
                    <span className="font-extrabold text-blue-700">
                      {confirmedReservation.preferredDate} {confirmedReservation.preferredTime}
                    </span>
                  </div>
                  <div className="flex items-start justify-between py-1.5 last:pb-0 gap-2">
                    <span className="text-slate-500 text-[11px] shrink-0">상담 희망 내용</span>
                    <span className="font-medium text-slate-800 text-right">
                      {confirmedReservation.concerns.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="break-keep-all">{ACADEMY_INFO.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>상담 문의: {ACADEMY_INFO.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-amber-950 bg-amber-50/90 p-2.5 rounded-lg border border-amber-200/80 text-[11px] leading-relaxed break-keep-all">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>지참 안내</strong>: 최근 학교 영어 시험지나 평소 풀던 문제집을 지참하시면, 학교별 서술형 감점 요인과 보완점을 당일 정밀하게 분석해 드립니다.
                    </span>
                  </div>
                </div>

                {/* Director Smartphone Real-Time Notification Status Badge */}
                <div className="mt-3 py-2.5 px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-900 font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>서버 접수 확인됨 · 방문 일정은 학원 확인 후 확정</span>
                </div>
              </div>

              {/* Direct Communication Action Section */}
              <div className="p-4 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border-2 border-blue-200 rounded-2xl space-y-3">
                <div className="text-center space-y-1">
                  <h5 className="font-black text-sm text-slate-900 flex items-center justify-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-700" />
                    <span>원장님께 예약 내용 바로 전송하기</span>
                  </h5>
                  <p className="text-xs text-slate-600 break-keep-all leading-normal">
                    아래 문자 전송을 누르시면 내용이 100% 자동 채워져 붙여넣기 없이 전송됩니다.
                  </p>
                </div>

                {/* 1. Primary Hero: Direct SMS Button (No Paste Needed!) */}
                <a
                  href={getDirectSmsUrl(confirmedReservation, directorMobile)}
                  className="w-full py-4 px-4 bg-[#122B49] hover:bg-[#1b3d66] text-white font-extrabold text-sm rounded-xl transition flex items-center justify-between shadow-md cursor-pointer active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5 text-amber-300" />
                    </div>
                    <div className="text-left">
                      <div className="font-black text-white text-xs sm:text-sm flex items-center gap-1.5">
                        <span>원장님 휴대폰으로 문자(SMS) 전송</span>
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                          내용 자동완성
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                        터치 시 문자앱에 자동 입력 • 붙여넣기 불필요 (010-2006-7525)
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 opacity-70 group-hover:opacity-100 shrink-0" />
                </a>

                {/* 2. Optional: KakaoTalk 1:1 Open Chat Button */}
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>추가 문의가 있으신가요?</span>
                    <span className="text-slate-400 font-medium">선택 사항</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenKakaoDirect}
                    className="w-full py-2.5 px-3 bg-[#FEE500] hover:bg-[#fedb00] text-[#191919] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.99]"
                  >
                    <MessageCircle className="w-4 h-4 fill-[#191919]" />
                    <span>카카오톡 1:1 오픈채팅으로 문의하기 (선택)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>

                {methodCSent && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center text-xs font-bold text-emerald-900 flex items-center justify-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>예약 내역이 클립보드에 복사되었습니다. 카카오톡 대화방에서 편하게 문의해 주세요!</span>
                  </div>
                )}

                {/* 3. Secondary Actions (Call & Copy) */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <a
                    href="tel:032-471-7525"
                    className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>상담실 전화 연결</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyTicket}
                    className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                    <span>{isCopied ? '복사 완료' : '예약증 복사'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 bg-[#0F2A4A] hover:bg-[#183a63] text-white font-extrabold text-sm rounded-xl transition cursor-pointer shadow-xs"
                >
                  확인 및 닫기
                </button>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Target School Badge Highlight */}
              <div className="bg-blue-50/80 border border-blue-200/80 p-3 rounded-xl flex items-start gap-2">
                <School className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span className="text-blue-950 font-bold text-xs break-keep-all leading-relaxed">
                  만수동 및 인근 11개교(동인천고, 숭덕여고, 문일여고, 만수고, 인제고, 신명여고, 만수북중, 만수중, 만수여중, 간석여중, 정각중) 5개년 기출 맞춤 정밀 진단
                </span>
              </div>

              {/* 1. Student Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    학생 성함 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="예: 김민준"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    학부모 연락처 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="예: 010-1234-5678"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* 2. School & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    재학 학교 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="" disabled>재학 중인 학교를 선택해 주세요</option>
                    {TARGET_SCHOOLS.map((s) => (
                      <option key={s.id} value={s.name} disabled={selectedGrade.includes('예비고1') && s.type === 'high'}>
                        {s.name} ({s.type === 'high' ? '고등' : '중등'})
                      </option>
                    ))}
                    <option value="인근 초/중/고등학교 (만수고·인제고 등)">
                      인근 초/중/고등학교 (만수고·인제고 등)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    현재 학년 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => { setSelectedGrade(e.target.value); setSelectedSchool(''); }}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white font-bold text-[#122B49]"
                  >
                    <option value="" disabled>현재 학년을 선택해 주세요</option>
                    {showPrep2027 && (
                      <option value="2027 예비고1 (현 중3)">🔥 2027 예비고1 (현 중3)</option>
                    )}
                    <option value="고3">고등학교 3학년</option>
                    <option value="고2">고등학교 2학년</option>
                    <option value="고1">고등학교 1학년</option>
                    <option value="중3">중학교 3학년</option>
                    <option value="중2">중학교 2학년</option>
                    <option value="중1">중학교 1학년</option>
                    <option value="초등">초등 고학년</option>
                  </select>
                </div>
              </div>

              {showPrep2027 && selectedGrade.includes('예비고1') && (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/60 border border-[#C59750] text-[#122B49] text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C59750] shrink-0" />
                    <span className="font-bold">2027 예비고1 고등영어 진단평가 신청 (60분 무료 테스트 + 1:1 심층 분석)</span>
                  </div>
                  <span className="text-[10px] bg-[#C59750] text-white px-2 py-0.5 rounded-full font-black shrink-0">
                    특별전형
                  </span>
                </div>
              )}

              {/* 3. Concerns checklist */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  영어 학습 주요 고민 (복수 선택 가능)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {COMMON_CONCERNS.map((con) => {
                    const isChecked = selectedConcerns.includes(con.label);
                    return (
                      <button
                        key={con.id}
                        type="button"
                        onClick={() => toggleConcern(con.label)}
                        className={`text-left p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-blue-50/90 border-blue-400 text-blue-950 font-semibold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center text-[10px] font-bold ${
                            isChecked ? 'bg-[#0F2A4A] text-white' : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && '✓'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 break-keep-all leading-snug">{con.label}</div>
                          <div className="text-[11px] text-slate-500 break-keep-all leading-relaxed mt-0.5">{con.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Preferred Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    방문 희망일자 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => { setPreferredDate(e.target.value); setPreferredTime(''); }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    방문 희망 시간 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value="" disabled>희망 시간을 선택해 주세요</option>
                      {preferredDate && [0, 6].includes(new Date(`${preferredDate}T12:00:00`).getDay()) && (
                        <>
                          <option value="10:00">오전 10:00</option>
                          <option value="11:00">오전 11:00</option>
                          <option value="12:00">오후 12:00</option>
                          <option value="13:00">오후 01:00</option>
                        </>
                      )}
                      <option value="14:00">오후 02:00</option>
                      <option value="15:00">오후 03:00</option>
                      <option value="16:00">오후 04:00</option>
                      <option value="17:00">오후 05:00</option>
                      <option value="18:00">오후 06:00 (추천)</option>
                      {preferredDate && ![0, 6].includes(new Date(`${preferredDate}T12:00:00`).getDay()) && (
                        <>
                          <option value="19:00">오후 07:00</option>
                          <option value="20:00">오후 08:00</option>
                          <option value="21:00">오후 09:00</option>
                          <option value="22:00">오후 10:00</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. Additional Notes */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  선생님께 남기실 말씀 (선택)
                </label>
                <textarea
                  rows={2}
                  placeholder="예: 지난 중간고사 70점대였는데 특히 서술형 감점이 심했습니다. 모의고사 변형 준비가 걱정됩니다."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Notice */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 space-y-1.5 break-keep-all">
                <div className="flex items-start gap-2">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                  <span className="flex-1 min-w-0">레벨테스트는 약 60분 소요되며, 학생의 어휘·문법·독해·서술형 4개 영역 객관적 진단 성적표를 당일 즉시 발급해 드립니다.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                  <span className="flex-1 min-w-0">1:1 맞춤 상담 후 학원 등록 강요가 일체 없으니 부담 없이 편하게 신청해 주세요.</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600">입력하신 이름·연락처·학교·학년·희망일시는 상담 접수 및 회신에 사용됩니다. 방문 일정은 학원 확인 후 확정됩니다.</p>
              {submitError && <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
                {submitError} <a className="underline font-bold" href="tel:032-471-7525">전화 문의</a> · <a className="underline font-bold" href={kakaoOpenChatUrl} target="_blank" rel="noopener noreferrer">카카오톡 문의</a>
              </div>}
              {!apiAvailable && <div role="status" className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 text-xs">
                온라인 예약 접수는 현재 준비 중입니다. 입력하신 내용은 전송되지 않습니다. <a className="underline font-bold" href="tel:032-471-7525">전화 문의</a> · <a className="underline font-bold" href={kakaoOpenChatUrl} target="_blank" rel="noopener noreferrer">카카오톡 문의</a>
              </div>}
              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !apiAvailable}
                  className="w-full py-3 bg-[#0F2A4A] hover:bg-[#183a63] disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4 text-amber-300" />
                  <span>{isSubmitting ? '접수 처리 중...' : apiAvailable ? '무료 레벨테스트 1:1 컨설팅 예약 신청' : '온라인 예약 준비 중'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
