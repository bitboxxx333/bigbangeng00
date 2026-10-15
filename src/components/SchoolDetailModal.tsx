import React from 'react';
import { X, School, Target, AlertTriangle, CheckCircle2, Sparkles, CalendarCheck, Quote, BookOpen, Award, BarChart3 } from 'lucide-react';
import { SchoolData } from '../types';

interface SchoolDetailModalProps {
  school: SchoolData | null;
  onClose: () => void;
  onStartConsultation: (school: SchoolData) => void;
  onBookTest: (school: SchoolData) => void;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  onClose,
  onStartConsultation,
  onBookTest,
}) => {
  if (!school) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border-2 border-[#122B49] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#122B49] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <School className="w-5 h-5 text-[#C59750]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">{school.name}</h3>
                <span className="bg-[#C59750] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  5개년 기출 DB
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{school.targetFocus}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-left text-xs sm:text-sm">
          {/* Quote Banner */}
          <div className="bg-blue-50/80 border border-blue-200 p-3.5 rounded-xl flex items-start gap-2.5">
            <Quote className="w-4 h-4 text-[#122B49] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-bold text-[#122B49] leading-relaxed break-keep-all">
              "{school.quote}"
            </p>
          </div>

          {/* Exam DNA: Textbook, Ratio, Grade Cut Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#122B49] font-black text-xs">
                <BookOpen className="w-3.5 h-3.5 text-[#C59750]" />
                <span>교재 및 시험범위</span>
              </div>
              <p className="text-slate-700 text-[11px] sm:text-xs font-medium leading-snug">
                {school.textbookInfo}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#122B49] font-black text-xs">
                <BarChart3 className="w-3.5 h-3.5 text-blue-700" />
                <span>배점 및 출제비율</span>
              </div>
              <p className="text-slate-700 text-[11px] sm:text-xs font-medium leading-snug">
                {school.examRatio}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-[#122B49] font-black text-xs">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>최상위 등급컷 동향</span>
              </div>
              <p className="text-slate-700 text-[11px] sm:text-xs font-medium leading-snug">
                {school.gradeCutTrend}
              </p>
            </div>
          </div>

          {/* Exam Features */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <Target className="w-4 h-4 text-[#122B49]" />
              <span>{school.badge} 최근 시험 핵심 출제 경향</span>
            </div>
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {school.examFeatures.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-700 text-xs sm:text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#122B49] shrink-0 mt-2" />
                  <span className="flex-1 leading-relaxed break-keep-all">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Killer Points */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-extrabold text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>학생들이 가장 많이 감점당하는 킬러 문항</span>
            </div>
            <div className="space-y-1.5 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
              {school.killerPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2 text-amber-950 text-xs sm:text-sm font-semibold">
                  <span className="text-amber-600 shrink-0 font-bold">⚠️</span>
                  <span className="flex-1 leading-relaxed break-keep-all">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Big Bang Academy 3-Step Solution */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-950 font-extrabold text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              <span>빅뱅영어학원만의 독보적 3단계 솔루션</span>
            </div>
            <div className="space-y-2 bg-blue-50/50 p-3.5 rounded-xl border border-blue-200">
              {school.bigBangSolution.map((sol, i) => (
                <div key={i} className="flex items-start gap-2.5 text-slate-800 text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#122B49] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1 leading-relaxed break-keep-all font-medium">{sol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartConsultation(school);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-[#122B49] rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-700" />
            <span>AI 상담실장으로 질문하기</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onBookTest(school);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#C59750] hover:bg-[#B58540] text-white rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-white" />
            <span>{school.badge} 무료 레벨테스트 신청</span>
          </button>
        </div>
      </div>
    </div>
  );
};
