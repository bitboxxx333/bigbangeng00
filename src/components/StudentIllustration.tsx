import React from 'react';
import { Sparkles, TrendingUp, Award } from 'lucide-react';
import friendlyStudentsImg from '../assets/images/friendly_students_1789791093328.jpg';

interface StudentIllustrationProps {
  className?: string;
}

export const StudentIllustration: React.FC<StudentIllustrationProps> = ({ className = 'w-full h-auto' }) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Soft Glow Background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 via-amber-100 to-blue-50 rounded-2xl blur-xs opacity-70 group-hover:opacity-100 transition-opacity" />

      {/* Main Friendly Students Image Container */}
      <div className="relative overflow-hidden rounded-xl border border-[#122B49]/20 shadow-sm bg-white">
        <img
          src={friendlyStudentsImg}
          alt="빅뱅영어학원 밝고 친근한 재원생들"
          referrerPolicy="no-referrer"
          className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-300"
          loading="eager"
        />

        {/* Subtle Vignette / Gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#122B49]/30 via-transparent to-transparent pointer-events-none" />

        {/* Floating Friendly Badge 1 - Top Left */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-xs border border-[#122B49]/20 shadow-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-[#C59750] animate-pulse" />
          <span className="text-[11px] sm:text-xs font-black text-[#122B49]">
            내신 1등급 선배들
          </span>
        </div>

        {/* Floating Friendly Badge 2 - Bottom Right */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-[#122B49]/95 text-white backdrop-blur-xs shadow-md px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none">
          <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[11px] sm:text-xs font-extrabold tracking-tight">
            내신 수직상승 96.4%
          </span>
        </div>

        {/* Floating Friendly Tag - Bottom Left */}
        <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 hidden sm:flex items-center gap-1 bg-amber-50/95 border border-amber-300/80 text-amber-950 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs">
          <Award className="w-3 h-3 text-[#C59750]" />
          <span>초·중·고 1:1 밀착관리</span>
        </div>
      </div>
    </div>
  );
};
