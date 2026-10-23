import React from 'react';
import { TARGET_SCHOOLS, COMMON_CONCERNS } from '../data/schools';
import { ConsultationStage, SchoolData } from '../types';
import { School, HelpCircle, CalendarCheck, Sparkles, BookOpen, FileText, Download } from 'lucide-react';

interface QuickActionToolbarProps {
  currentStage: ConsultationStage;
  selectedSchool?: SchoolData;
  onSendPresetMessage: (text: string) => void;
  onOpenReservationModal: () => void;
  onOpenSchoolGuide: () => void;
  onOpenDiagnosticReport?: () => void;
}

export const QuickActionToolbar: React.FC<QuickActionToolbarProps> = ({
  currentStage,
  selectedSchool,
  onSendPresetMessage,
  onOpenReservationModal,
  onOpenSchoolGuide,
  onOpenDiagnosticReport,
}) => {
  return (
    <div id="quick-action-toolbar" className="p-3 sm:p-3.5 bg-slate-50/90 border-t border-slate-200">
      {/* Dynamic stage title / guidance */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-blue-700 shrink-0" />
          <span className="break-keep-all leading-snug">
            {currentStage === 1
              ? '1단계: 학생의 재학 학교를 선택해 주세요'
              : currentStage === 2
              ? '2단계: 가장 답답한 영어 고민을 선택해 주세요'
              : currentStage === 3
              ? '3단계: 학교별 준비 방향 및 레벨테스트 안내'
              : '4단계: 방문 상담 문의 및 일정 조율'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSchoolGuide}
            className="text-[11px] text-slate-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer py-1 px-2 rounded-md hover:bg-slate-200/60 transition"
          >
            <BookOpen className="w-3 h-3 text-slate-500" />
            <span>기출분석</span>
          </button>
          <button
            type="button"
            onClick={onOpenReservationModal}
            className="text-[11px] text-orange-900 hover:text-orange-950 font-bold bg-amber-100/80 hover:bg-amber-200/80 border border-amber-300/80 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>상담 문의</span>
          </button>
        </div>
      </div>

      {/* Stage 1: Quick School Selection Buttons */}
      {currentStage === 1 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {TARGET_SCHOOLS.map((school) => (
            <button
              key={school.id}
              type="button"
              onClick={() => onSendPresetMessage(`${school.name} 학생입니다. 내신 대비와 상담을 받고 싶어요.`)}
              className="text-xs bg-white hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300 text-slate-800 font-semibold px-3 py-2 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer flex items-center gap-1.5 break-keep-all"
            >
              <School className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>{school.badge}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => onSendPresetMessage('만수동 인근 초/중/고등학교 학생입니다. 상담 부탁드립니다.')}
            className="text-xs bg-white hover:bg-slate-100 text-slate-600 font-medium px-3 py-2 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer break-keep-all"
          >
            기타 인근 학교
          </button>
        </div>
      )}

      {/* Stage 2: Quick Learning Concern Buttons */}
      {currentStage === 2 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {COMMON_CONCERNS.map((concern) => (
            <button
              key={concern.id}
              type="button"
              onClick={() => onSendPresetMessage(`${concern.label} 고민이 큽니다. (${concern.desc})`)}
              className="text-xs bg-white hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300 text-slate-800 font-semibold px-3 py-2 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer flex items-start gap-1.5 break-keep-all text-left leading-snug"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{concern.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Stage 3 & 4: Solution & Reservation CTA Buttons */}
      {currentStage >= 3 && (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <button
              type="button"
              onClick={onOpenReservationModal}
              className="flex-1 py-3 px-4 bg-[#0F2A4A] hover:bg-[#183a63] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer break-keep-all text-center leading-snug"
            >
              <CalendarCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <span>무료 레벨테스트 방문 상담 문의하기</span>
            </button>

            {onOpenDiagnosticReport && (
              <button
                type="button"
                onClick={onOpenDiagnosticReport}
                className="py-3 px-4 bg-[#C59750] hover:bg-[#d4a863] text-[#122B49] font-black text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer break-keep-all text-center leading-snug shrink-0"
              >
                <Download className="w-4 h-4 text-[#122B49]" />
                <span>맞춤 진단 리포트 PDF 다운로드</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onSendPresetMessage(
                selectedSchool
                  ? `${selectedSchool.name} 맞춤 무료 레벨테스트는 몇 분 정도 걸리고 어떤 문제가 나오나요?`
                  : '무료 레벨테스트는 몇 분 정도 걸리고 어떤 영역을 진단하나요?'
              )
            }
            className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition shadow-2xs cursor-pointer break-keep-all text-center"
          >
            레벨테스트 진행방식 및 준비물 문의
          </button>
        </div>
      )}
    </div>
  );
};
