import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { StudentIllustration } from './StudentIllustration';

interface HeroSectionProps {
  onOpenReservationModal: () => void;
  onOpenAIChat: () => void;
  onOpenPrepReservation: () => void;
  showPrep2027?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenReservationModal,
  onOpenAIChat,
  onOpenPrepReservation,
  showPrep2027 = true,
}) => {
  return (
    <section className="relative w-full py-6 sm:py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Big Bold Typography & Caramel CTA Button */}
          <div className="md:col-span-6 lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold text-[#122B49]">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  <span>만수동 및 인근 11개교 5개년 기출 DB 정밀 분석</span>
                </div>
                
                {/* 2027 예비고1 Special Direct Tag (Visible when campaign is active) */}
                {showPrep2027 && (
                  <button
                    type="button"
                    onClick={onOpenPrepReservation}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-amber-100/80 border border-[#C59750] px-3 py-1 rounded-full text-xs font-black text-[#122B49] hover:border-amber-600 transition shadow-2xs cursor-pointer group"
                  >
                    <span className="bg-[#C59750] text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                      HOT
                    </span>
                    <span className="text-[#845e23]">2027 예비고1 고등영어 진단예약</span>
                    <ArrowRight className="w-3 h-3 text-[#C59750] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#122B49] leading-[1.2] tracking-tight break-keep-all">
                만수동 초·중·고<br />
                내신 1등급 &amp;<br />
                수능 완성 전문
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-lg break-keep-all pt-1">
                동인천고·숭덕여고·문일여고·만수고·인제고·신명여고·만수북중·만수중·만수여중·간석여중·정각중 학교별 킬러 문항과 서술형 감점을 1:1로 밀착 관리합니다.
              </p>
            </div>

            {/* Warm Caramel / Camel Pill Button matching the reference image */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenReservationModal}
                className="bg-[#C59750] hover:bg-[#B58540] text-white font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-98 cursor-pointer flex items-center gap-2 group"
              >
                <span>무료 레벨테스트 및 학습 진단 신청</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </button>

              {showPrep2027 && (
                <button
                  type="button"
                  onClick={onOpenPrepReservation}
                  className="bg-[#122B49] hover:bg-[#1a3a60] text-amber-300 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-full transition shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5 border border-amber-300/30"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>2027 예비고1 진단예약</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenAIChat}
                className="bg-white hover:bg-slate-50 border-2 border-[#122B49] text-[#122B49] font-bold text-xs sm:text-sm px-4 py-3 rounded-full transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-blue-700" />
                <span>AI 상담실장</span>
              </button>
            </div>
          </div>

          {/* Right Column: Korean Students Illustration in School Uniform */}
          <div className="md:col-span-6 lg:col-span-5 flex justify-center items-center">
            <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-xs p-3 sm:p-5 rounded-2xl border-2 border-[#122B49]/15 shadow-sm">
              <StudentIllustration className="w-full h-auto drop-shadow-xs" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
