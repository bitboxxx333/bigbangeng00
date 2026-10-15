import React, { useState } from 'react';
import { School, ChevronRight, GraduationCap, BookOpen, ArrowLeft, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TARGET_SCHOOLS } from '../data/schools';
import { SchoolData } from '../types';

interface SchoolCardGridProps {
  onSelectSchool: (school: SchoolData) => void;
  onTagClick: (school: SchoolData, tag: string) => void;
}

export const SchoolCardGrid: React.FC<SchoolCardGridProps> = ({
  onSelectSchool,
  onTagClick,
}) => {
  // Mode: 'overview' (2 main frames: High vs Middle) or 'high' or 'middle'
  const [selectedTrack, setSelectedTrack] = useState<'overview' | 'high' | 'middle'>('overview');

  // 4 standard tags per school matching the 2x2 layout
  const getSchoolTags = (school: SchoolData) => {
    if (school.id === 'dongincheon_high') {
      return ['1학기 중간고사 분석', '주요 기출 유형', '서술형 대비 전략', '모의고사 변형'];
    }
    if (school.id === 'sungduk_high') {
      return ['1학기 중간고사 분석', '주요 기출 유형', '서술형 대비 전략', '조건 영작 클리닉'];
    }
    if (school.id === 'moonil_high') {
      return ['1학기 중간고사 분석', '주요 기출 유형', '서술형 대비 전략', '어법 고쳐쓰기'];
    }
    if (school.id === 'mansu_high') {
      return ['1학기 중간고사 분석', '주요 기출 유형', '서술형 대비 전략', '요약문 빈칸 완성'];
    }
    if (school.id === 'inje_high') {
      return ['1학기 중간고사 분석', '주요 기출 유형', '서술형 대비 전략', '수능형 고난도 어법'];
    }
    if (school.id === 'shinmyeong_high') {
      return ['1학기 중간고사 분석', '주요 기출 유형', '서술형 대비 전략', '어순 배열 및 어휘'];
    }
    if (school.id === 'mansubuk_mid') {
      return ['1학기 중간고사 분석', '주요 기출 유형', '서술형 대비 전략', '대화문 변형 특훈'];
    }
    if (school.id === 'ganseok_girls_mid') {
      return ['1학기 중간고사 분석', '주요 기출 유형', '서술형 대비 전략', '학습지 100% 연계'];
    }
    if (school.id === 'jeonggak_mid') {
      return ['1학기 중간고사 분석', '주요 기출 유형', '서술형 대비 전략', '모두 고르기 및 영작'];
    }
    if (school.id === 'mansu_mid') {
      return ['1학기 중간고사 분석', '주요 기출 유형', '서술형 대비 전략', '모두 고르기 공략'];
    }
    return ['1학기 중간고사 분석', '주요 기출 유형', '서술형 대비 전략', '프린트물 100% 암기'];
  };

  const highSchools = TARGET_SCHOOLS.filter((s) => s.type === 'high');
  const middleSchools = TARGET_SCHOOLS.filter((s) => s.type === 'middle');

  const activeSchools = selectedTrack === 'high' ? highSchools : middleSchools;

  return (
    <section id="school-analysis" className="w-full py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {selectedTrack === 'overview' ? (
            /* 1. Main 2-Frame Selection View: High School vs Middle School */
            <motion.div
              key="overview-frames"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Section Header */}
              <div className="text-center sm:text-left pb-3 border-b border-[#122B49]/15 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#122B49] mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                    <span>학교별 맞춤 5개년 기출 연구소</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#122B49] tracking-tight">
                    재학 중인 학교 과정을 선택해주세요
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                    고등학교와 중학교의 출제 경향 및 배점 구조에 맞춘 1:1 기출 분석관으로 바로 진입합니다.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-500 self-center sm:self-end">
                  만수동 및 인근 11개교 전수 DB 구축
                </div>
              </div>

              {/* 2 Big Track Selector Frames */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                {/* [FRAME 1] High School Track */}
                <div
                  id="frame-high-school"
                  onClick={() => setSelectedTrack('high')}
                  className="group relative bg-white rounded-2xl border-2 border-[#122B49] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                >
                  {/* Top Accent Strip */}
                  <div className="h-3 bg-gradient-to-r from-[#122B49] via-[#1e3a5f] to-[#C59750] w-full" />

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#122B49] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                          <GraduationCap className="w-8 h-8 text-[#C59750]" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-black">
                          고등부 6개교
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-[#122B49] tracking-tight mb-2 group-hover:text-blue-900 transition-colors">
                        고등학교 기출 분석관
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-5">
                        수능형 모의고사 변형 연계, 서술형 고배점 조건 영작 및 1등급 컷 정복을 위한 학교별 맞춤 솔루션을 확인하세요.
                      </p>

                      {/* Included Schools Chips */}
                      <div className="mb-5">
                        <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                          분석 대상 학교 ({highSchools.length}개교)
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {highSchools.map((s) => (
                            <span
                              key={s.id}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
                            >
                              {s.badge}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Key Highlights */}
                      <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-700 font-semibold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#C59750] shrink-0" />
                          <span>모의고사 2~3개년 및 EBS 부교재 변형(70~80%) 완벽 대비</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#C59750] shrink-0" />
                          <span>밑줄 없는 통문장 어법 찾기 & 요약문 조건 영작 핀셋 첨삭</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#C59750] shrink-0" />
                          <span>1등급 컷(평균 92~96점) 결정을 위한 서술형 무감점 클리닉</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-2">
                      <div className="w-full py-3.5 px-5 bg-[#122B49] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 group-hover:bg-[#1a385c] transition-colors shadow-sm">
                        <span>고등학교 6개교 분석 보기</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* [FRAME 2] Middle School Track */}
                <div
                  id="frame-middle-school"
                  onClick={() => setSelectedTrack('middle')}
                  className="group relative bg-white rounded-2xl border-2 border-[#122B49] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                >
                  {/* Top Accent Strip */}
                  <div className="h-3 bg-gradient-to-r from-[#122B49] via-[#0284c7] to-[#38bdf8] w-full" />

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#122B49] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                          <BookOpen className="w-8 h-8 text-sky-400" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-900 border border-sky-200 text-xs font-black">
                          중등부 5개교
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-[#122B49] tracking-tight mb-2 group-hover:text-blue-900 transition-colors">
                        중학교 기출 분석관
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-5">
                        학교별 배부 학습지 100% 암기, 단원별 어법 영작 및 전교권 내신 100점 A등급 완성을 위한 맞춤 분석을 확인하세요.
                      </p>

                      {/* Included Schools Chips */}
                      <div className="mb-5">
                        <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                          분석 대상 학교 ({middleSchools.length}개교)
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {middleSchools.map((s) => (
                            <span
                              key={s.id}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 group-hover:bg-sky-50 group-hover:border-sky-200 transition-colors"
                            >
                              {s.badge}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Key Highlights */}
                      <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-700 font-semibold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>학교 배부 문법·어휘 학습지(프린트물) 100% 연계 적중 워크북</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>교과서 단원별 핵심 문법 서술형 5단계 영작 드릴북</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>'모두 고르기(다중 선택)' 및 개수형 킬러 문항 소거 훈련</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-2">
                      <div className="w-full py-3.5 px-5 bg-[#122B49] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 group-hover:bg-[#1a385c] transition-colors shadow-sm">
                        <span>중학교 5개교 분석 보기</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* 2. Detailed School Analysis Grid View for the Selected Track */
            <motion.div
              key={`track-${selectedTrack}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Header with Back Navigation & Track Switcher */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#122B49] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTrack('overview')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer border border-slate-300 shrink-0"
                    title="고등/중등 과정 선택으로 돌아가기"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>과정 선택</span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-[#122B49] tracking-tight">
                        {selectedTrack === 'high' ? '고등학교 내신 정밀 분석' : '중학교 내신 정밀 분석'}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                        {activeSchools.length}개교
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      학교 카드의 4대 분석툴을 클릭하면 AI 상담실장이 1:1 맞춤 진단을 안내합니다.
                    </p>
                  </div>
                </div>

                {/* Track Switcher (Switch between High and Middle without returning) */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-stretch sm:self-auto justify-center">
                  <button
                    type="button"
                    onClick={() => setSelectedTrack('high')}
                    className={`text-xs px-3.5 py-2 rounded-lg font-black transition cursor-pointer flex items-center gap-1.5 ${
                      selectedTrack === 'high'
                        ? 'bg-[#122B49] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>고등학교 ({highSchools.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTrack('middle')}
                    className={`text-xs px-3.5 py-2 rounded-lg font-black transition cursor-pointer flex items-center gap-1.5 ${
                      selectedTrack === 'middle'
                        ? 'bg-[#122B49] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>중학교 ({middleSchools.length})</span>
                  </button>
                </div>
              </div>

              {/* School Cards Grid for Active Track */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {activeSchools.map((school) => {
                  const tags = getSchoolTags(school);
                  return (
                    <div
                      key={school.id}
                      className="bg-white rounded-xl border-2 border-[#122B49] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
                    >
                      {/* Top Deep Navy Accent Bar */}
                      <div className="h-2.5 bg-[#122B49] w-full" />

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        {/* Card Header: Round Navy Badge + School Name + Detail Trigger */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#122B49] text-white flex items-center justify-center shrink-0 shadow-xs">
                              {school.type === 'high' ? (
                                <GraduationCap className="w-5 h-5 text-[#C59750]" />
                              ) : (
                                <BookOpen className="w-5 h-5 text-sky-400" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg sm:text-xl font-black text-[#122B49] tracking-tight group-hover:text-blue-900 transition-colors">
                                {school.badge}
                              </h3>
                              <span className="text-[11px] text-slate-500 font-semibold">
                                {school.type === 'high' ? '고등부 내신 1등급' : '중등부 내신 100점'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSelectSchool(school)}
                            className="text-xs font-bold text-[#122B49] hover:bg-slate-100 p-1.5 rounded-lg transition flex items-center gap-0.5 cursor-pointer"
                            title={`${school.badge} 정밀 기출 분석표 열기`}
                          >
                            <span className="hidden sm:inline">상세</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* 4 Standard Analysis Tool Chips (2x2 Grid) */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {tags.map((tag, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => onTagClick(school, tag)}
                              className="bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-[#122B49] text-slate-700 hover:text-[#122B49] text-[11px] sm:text-xs font-bold py-2 px-2.5 rounded-lg transition text-center truncate cursor-pointer shadow-2xs active:scale-98"
                              title={`${school.name} ${tag} 클릭 시 AI 분석`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Switch Callout */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-blue-900 shrink-0" />
                  <span>
                    현재 <strong>{selectedTrack === 'high' ? '고등학교 6개교' : '중학교 5개교'}</strong> 기출 분석 모드입니다. 다른 과정을 확인하시려면 상단 탭을 전환하세요.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTrack(selectedTrack === 'high' ? 'middle' : 'high')}
                  className="font-bold text-blue-900 hover:underline cursor-pointer shrink-0"
                >
                  {selectedTrack === 'high' ? '중학교 기출 분석관으로 이동 →' : '고등학교 기출 분석관으로 이동 →'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
