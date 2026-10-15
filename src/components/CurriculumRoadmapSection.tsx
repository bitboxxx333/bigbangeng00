import React from 'react';
import { Lightbulb, BookOpen, School, GraduationCap } from 'lucide-react';

export const CurriculumRoadmapSection: React.FC = () => {
  const steps = [
    {
      id: 'elem',
      title: '초등부',
      icon: Lightbulb,
      desc: '초등부 학습은 처음엔 어휘와 통문장 구문 완성',
      target: '기초 어휘 2,000단어 & 기본 문법'
    },
    {
      id: 'mid',
      title: '중등부',
      icon: BookOpen,
      desc: '1학기 중간고사 분석 / 주요 기출 유형 정복',
      target: '만수북중·만수중·만수여중 100점'
    },
    {
      id: 'high',
      title: '고등부',
      icon: School,
      desc: '완벽한 학교별 암기 / 빈출 변형 문제 완벽 분석',
      target: '동인천고·숭덕여고·문일여고 1등급'
    },
    {
      id: 'sat',
      title: '수능반',
      icon: GraduationCap,
      desc: '수능 1등급 완성 / 킬러 빈칸·순서 1:1 클리닉',
      target: '수능 모의고사 안정적 1등급'
    }
  ];

  return (
    <div id="curriculum" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-black text-[#122B49] tracking-tight">
          커리큘럼 로드맵
        </h3>
        <span className="text-xs font-bold text-slate-500">
          초등 기초부터 수능 1등급까지
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-300 p-4 sm:p-5 hover:border-[#122B49] transition-colors shadow-xs">
        {/* Horizontal Stepper matching the reference image */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-7 left-8 right-8 h-1 bg-[#122B49]/20 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-3 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center text-center space-y-2.5 p-2 rounded-lg hover:bg-slate-50 transition"
                >
                  {/* Node Badge */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#122B49] text-white flex items-center justify-center border-4 border-white shadow-sm ring-2 ring-[#122B49]/20">
                    <Icon className="w-6 h-6 text-[#C59750]" />
                  </div>

                  <div className="space-y-1 w-full">
                    <div className="inline-block bg-blue-50 border border-blue-200 text-[#122B49] font-black text-xs px-2.5 py-0.5 rounded-full">
                      {idx + 1}단계 • {step.title}
                    </div>
                    <p className="text-xs text-slate-700 font-bold leading-snug break-keep-all pt-1">
                      {step.desc}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {step.target}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
