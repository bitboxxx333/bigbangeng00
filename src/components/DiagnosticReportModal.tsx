import React, { useRef, useState } from 'react';
import { SchoolData, ChatMessage, Reservation } from '../types';
import { ACADEMY_INFO, TARGET_SCHOOLS } from '../data/schools';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  School, 
  AlertTriangle, 
  BookOpen, 
  MapPin, 
  Phone, 
  Calendar,
  Award,
  Clock,
  ShieldCheck,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface DiagnosticReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSchool?: SchoolData;
  selectedGrade?: string;
  selectedConcerns?: string[];
  messages: ChatMessage[];
  reservation?: Reservation;
  onOpenReservationModal?: () => void;
}

export const DiagnosticReportModal: React.FC<DiagnosticReportModalProps> = ({
  isOpen,
  onClose,
  selectedSchool,
  selectedGrade,
  selectedConcerns = [],
  messages,
  reservation,
  onOpenReservationModal,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Resolve school: prop -> reservation -> messages -> default
  let currentSchool = selectedSchool;
  if (!currentSchool && reservation?.school) {
    currentSchool = TARGET_SCHOOLS.find(s => s.name === reservation.school || s.badge === reservation.school);
  }
  if (!currentSchool) {
    const msgWithSchool = messages.find(m => m.schoolData);
    if (msgWithSchool?.schoolData) {
      currentSchool = msgWithSchool.schoolData;
    }
  }
  // Default to Dongincheon High if still undefined for a rich sample report
  const displaySchool = currentSchool || TARGET_SCHOOLS[0];

  const displayGrade = selectedGrade || reservation?.grade || '고등학교 1학년';
  const displayConcerns = (selectedConcerns.length > 0) 
    ? selectedConcerns 
    : (reservation?.concerns && reservation.concerns.length > 0)
    ? reservation.concerns
    : ['서술형 조건 영작 감점 요인 심화', '모의고사 및 부교재 변형 지문 대처', '어휘 암기 휘발성 및 어법 체계성'];

  // Extract key AI consultation messages (excluding init)
  const aiAnalysisMessages = messages.filter(
    (m) => m.sender === 'ai' && m.id !== 'msg-init'
  );

  const reportId = reservation?.id 
    ? `REP-${reservation.id.replace('BB-REV-', '')}`
    : `REP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const issueDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleDownloadPdf = async () => {
    if (!reportRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      // Allow DOM to settle
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Crisp retina-level rendering
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const filename = `빅뱅영어학원_1대1_맞춤학습진단리포트_${displaySchool.badge}_${displayGrade}.pdf`;
      pdf.save(filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('PDF 다운로드 중 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 인쇄 기능을 이용해 주세요.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border-2 border-[#122B49] max-w-4xl w-full h-[92vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Control Bar */}
        <div className="bg-[#122B49] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#C59750]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  맞춤형 학습진단 리포트 요약본
                </h3>
                <span className="bg-[#C59750] text-[#122B49] text-[10px] font-black px-2 py-0.5 rounded-md">
                  PDF 발급
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                빅뱅영어학원 5개년 기출 DB 기반 정밀 진단 및 1:1 솔루션 요약서
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              title="인쇄하기"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>인쇄</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-[#122B49] bg-[#C59750] hover:bg-[#d4a863] rounded-lg transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>{isGeneratingPdf ? 'PDF 생성 중...' : 'PDF 다운로드'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer ml-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Download Success Notice */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs text-emerald-800 font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              진단 리포트 PDF가 성공적으로 다운로드되었습니다! (다운로드 폴더 확인)
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">인천 만수동 빅뱅영어학원</span>
          </div>
        )}

        {/* Scrollable Printable Report Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100 flex justify-center">
          {/* Printable Sheet (800px standard for A4 layout) */}
          <div
            ref={reportRef}
            id="printable-report-card"
            className="bg-white border border-slate-300 rounded-xl shadow-lg p-6 sm:p-10 max-w-[800px] w-full text-slate-900 font-sans space-y-6"
          >
            {/* Header Document Brand */}
            <div className="border-b-2 border-[#122B49] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-[#122B49] text-white text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-sm uppercase">
                    Official Diagnostic Report
                  </span>
                  <span className="text-xs text-slate-500 font-bold">인천 만수동 내신 전문 1위</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#122B49] tracking-tight">
                  빅뱅영어학원 1:1 맞춤 학습진단 리포트
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  만수동 6개교 5개년 기출 DB 및 킬러문항 정밀 분석 보고서
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-5 space-y-0.5 text-xs text-slate-600">
                <p className="font-bold text-slate-900 text-sm">문서번호: {reportId}</p>
                <p>진단일시: {issueDate}</p>
                <p>발행기관: 빅뱅영어학원 학습전략연구소</p>
              </div>
            </div>

            {/* Section 1: Student & Target School Profile */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
              <h2 className="text-xs font-black text-[#122B49] tracking-wider uppercase mb-3 flex items-center gap-1.5">
                <School className="w-4 h-4 text-[#C59750]" />
                <span>01. 진단 대상 학생 및 목표 학교 프로필</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block mb-0.5">재학/목표 학교</span>
                  <strong className="text-sm font-black text-[#122B49]">{displaySchool.name}</strong>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block mb-0.5">대상 학년</span>
                  <strong className="text-sm font-black text-slate-800">{displayGrade}</strong>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block mb-0.5">시험 특징 요약</span>
                  <span className="text-xs font-bold text-blue-900 block truncate">{displaySchool.targetFocus}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block mb-0.5">1등급 컷 동향</span>
                  <span className="text-xs font-bold text-amber-900 block">{displaySchool.gradeCutTrend}</span>
                </div>
              </div>

              {/* Stated Concerns */}
              <div className="mt-3 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  주요 호소 고민 및 취약점 진단 항목:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {displayConcerns.map((c, i) => (
                    <span
                      key={i}
                      className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-semibold"
                    >
                      • {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: School Specific Exam DNA & Killer Points */}
            <div className="border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
              <h2 className="text-xs font-black text-[#122B49] tracking-wider uppercase flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#C59750]" />
                <span>02. {displaySchool.name} 출제 경향 및 킬러 문항 정밀 분석</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2">
                  <h3 className="font-bold text-blue-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                    <span>기출 출제 기본 공식 & 교재</span>
                  </h3>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {displaySchool.textbookInfo}
                  </p>
                  <p className="text-[11px] text-blue-900 font-bold">
                    배점 비율: {displaySchool.examRatio}
                  </p>
                </div>

                <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl space-y-2">
                  <h3 className="font-bold text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>감점 다발 킬러 포인트 (Killer Points)</span>
                  </h3>
                  <ul className="space-y-1 text-slate-700 leading-relaxed font-medium">
                    {displaySchool.killerPoints.map((kp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-700 font-bold shrink-0">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exam Features list */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-900 mb-2">
                  {displaySchool.name} 5개년 핵심 출제 패턴 요약:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  {displaySchool.examFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#122B49] mt-1.5 shrink-0" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: AI Consultation Key Diagnosis Notes */}
            {aiAnalysisMessages.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
                <h2 className="text-xs font-black text-[#122B49] tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C59750]" />
                  <span>03. AI 상담실장 1:1 맞춤 진단 소견 요약</span>
                </h2>

                <div className="space-y-2.5 text-xs text-slate-700">
                  {aiAnalysisMessages.slice(-2).map((msg, idx) => {
                    const clean = msg.text.replace(/[*#_`]/g, '');
                    return (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 leading-relaxed">
                        <p className="font-bold text-blue-950 mb-1">
                          진단 코멘트 #{idx + 1}
                        </p>
                        <p className="line-clamp-4 text-slate-800">{clean}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 4: BigBang 4-Step Solution Prescription */}
            <div className="bg-[#122B49] text-white rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black tracking-wider uppercase text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>04. 빅뱅영어학원 독점 솔루션 & 처방 가이드</span>
                </h2>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-slate-200">
                  내신 1등급 직결 프로그램
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {displaySchool.bigBangSolution.map((sol, idx) => (
                  <div key={idx} className="bg-white/10 p-3 rounded-lg border border-white/10 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#C59750] text-[#122B49] font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-100 font-medium leading-relaxed">{sol}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/15 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <p className="text-amber-200 font-medium">
                  💡 본 리포트는 1차 요약본이며, <strong>학원 방문 시 60분 무료 정밀 레벨테스트</strong>를 통해 어휘·문법·구문 성적표를 즉시 발급해 드립니다.
                </p>
              </div>
            </div>

            {/* Section 5: Academy Information & Contact Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
              <div className="space-y-1">
                <strong className="text-slate-900 text-sm font-black block">{ACADEMY_INFO.name}</strong>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{ACADEMY_INFO.location} {ACADEMY_INFO.subLocation}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>상담 및 예약: <strong>{ACADEMY_INFO.phone}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">원장 직통 1:1 상담</span>
                  <a
                    href={ACADEMY_INFO.kakaoChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#191919] bg-[#FEE500] px-3 py-1.5 rounded-lg hover:bg-[#fedb00] transition shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-[#191919]" />
                    <span>카카오톡 오픈채팅</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Sticky Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>이 리포트는 상담창 및 레벨테스트 예약 시 언제든 다시 열람 및 다운로드하실 수 있습니다.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenReservationModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReservationModal();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#122B49] hover:bg-[#1c3e66] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C59750]" />
                <span>무료 레벨테스트 예약하기</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#C59750] hover:bg-[#d4a863] text-[#122B49] rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>{isGeneratingPdf ? 'PDF 저장 중...' : 'PDF 다운로드'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
