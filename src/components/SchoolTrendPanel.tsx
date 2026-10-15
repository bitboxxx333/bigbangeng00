import React, { useState } from 'react';
import { TARGET_SCHOOLS, OTHER_SCHOOL_INFO, ACADEMY_INFO } from '../data/schools';
import { SchoolData } from '../types';
import { School, CheckCircle2, AlertTriangle, Lightbulb, ChevronRight, BookOpen, ShieldCheck } from 'lucide-react';

interface SchoolTrendPanelProps {
  currentSchool?: SchoolData;
  onSelectSchool: (school: SchoolData) => void;
  onRequestReservation: () => void;
}

export const SchoolTrendPanel: React.FC<SchoolTrendPanelProps> = ({
  currentSchool,
  onSelectSchool,
  onRequestReservation,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'middle'>('all');
  const [expandedSchoolId, setExpandedSchoolId] = useState<string>(
    currentSchool?.id || 'dongincheon_high'
  );

  const filteredSchools = TARGET_SCHOOLS.filter((school) => {
    if (activeTab === 'high') return school.type === 'high';
    if (activeTab === 'middle') return school.type === 'middle';
    return true;
  });

  const activeSchool =
    TARGET_SCHOOLS.find((s) => s.id === expandedSchoolId) ||
    (currentSchool?.id === OTHER_SCHOOL_INFO.id ? OTHER_SCHOOL_INFO : TARGET_SCHOOLS[0]);

  return (
    <aside id="school-trend-panel" className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-900 rounded-lg">
              <School className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">만수동 및 인근 11개교 기출 연구소</h2>
          </div>
          <span className="text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            빅뱅 5개년 DB
          </span>
        </div>
        <p className="text-xs text-slate-500">
          학교마다 출제 코드와 서술형 기준이 완전히 다릅니다. 우리 학교 맞춤 전략을 확인하세요.
        </p>

        {/* School Category Tabs */}
        <div className="flex gap-1.5 mt-3">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`text-xs px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            전체 ({TARGET_SCHOOLS.length}개교)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('high')}
            className={`text-xs px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              activeTab === 'high'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            고등학교 ({TARGET_SCHOOLS.filter((s) => s.type === 'high').length}개교)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('middle')}
            className={`text-xs px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
              activeTab === 'middle'
                ? 'bg-[#0F2A4A] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            중학교 ({TARGET_SCHOOLS.filter((s) => s.type === 'middle').length}개교)
          </button>
        </div>
      </div>

      {/* School Selection Chips */}
      <div className="p-3 border-b border-slate-100 flex flex-wrap gap-1.5 bg-white">
        {filteredSchools.map((s) => {
          const isSelected = s.id === activeSchool.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setExpandedSchoolId(s.id);
                onSelectSchool(s);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                isSelected
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>{s.badge}</span>
              {isSelected && <span className="text-[10px]">●</span>}
            </button>
          );
        })}
      </div>

      {/* Active School Deep Dive Content */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
        {/* School Name & Core Focus */}
        <div className="bg-blue-50/80 border border-blue-200/90 rounded-xl p-3.5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-bold text-slate-900 text-sm tracking-tight">{activeSchool.name}</span>
            <span className="text-[10px] font-bold text-blue-900 bg-white border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
              {activeSchool.type === 'high' ? '고등 내신 집중' : '중등 내신 집중'}
            </span>
          </div>
          <p className="text-xs font-bold text-[#0F2A4A] leading-relaxed break-keep-all">
            🎯 {activeSchool.targetFocus}
          </p>
        </div>

        {/* 1. Exam Features */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2.5 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span>{activeSchool.badge} 주요 출제 특징</span>
          </h3>
          <ul className="space-y-1.5">
            {activeSchool.examFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700 text-xs leading-relaxed break-keep-all py-1 border-b border-slate-100 last:border-0">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                <span className="flex-1 min-w-0">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Killer Points */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-amber-950 flex items-center gap-1.5 mb-2 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>학생들이 가장 많이 틀리는 킬러 포인트</span>
          </h3>
          <ul className="space-y-1.5">
            {activeSchool.killerPoints.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2 text-amber-950/90 text-xs leading-relaxed break-keep-all py-1 border-b border-amber-100/70 last:border-0">
                <span className="shrink-0 text-amber-600 font-bold text-xs mt-0.5">⚠️</span>
                <span className="flex-1 min-w-0">{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Big Bang English Targeted Solution */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-emerald-950 flex items-center gap-1.5 mb-2 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>빅뱅영어학원만의 맞춤 공략 솔루션</span>
          </h3>
          <ul className="space-y-1.5">
            {activeSchool.bigBangSolution.map((sol, idx) => (
              <li key={idx} className="flex items-start gap-2 text-emerald-950 text-xs leading-relaxed break-keep-all py-1 border-b border-emerald-100/70 last:border-0">
                <span className="shrink-0 w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center mt-0.5">
                  ✓
                </span>
                <span className="flex-1 min-w-0">{sol}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quote */}
        <div className="bg-slate-50 border-l-3 border-blue-600 p-3 rounded-r-xl text-slate-700 text-xs leading-relaxed break-keep-all italic">
          "{activeSchool.quote}"
        </div>

        {/* 3 Big Bang Academy Core Strengths Reminder */}
        <div className="pt-2 border-t border-slate-100">
          <span className="font-bold text-slate-900 block mb-2.5 text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
            <span>빅뱅영어학원 3대 핵심 강점</span>
          </span>
          <div className="space-y-2 text-slate-600">
            {ACADEMY_INFO.coreStrengths.map((st, i) => (
              <div key={i} className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/70 text-left">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-[#0F2A4A] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-bold text-slate-900 text-xs break-keep-all leading-snug">
                    {st.title}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed break-keep-all pl-5.5">
                  {st.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <button
          type="button"
          onClick={onRequestReservation}
          className="w-full py-2.5 px-3 bg-[#0F2A4A] hover:bg-[#183a63] text-white rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{activeSchool.badge} 맞춤 무료 레벨테스트 예약</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
