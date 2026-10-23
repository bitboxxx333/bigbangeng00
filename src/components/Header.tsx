import React from 'react';
import { Sparkles, ClipboardList, Lock, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenReservations: () => void;
  onOpenAIChat: () => void;
  reservationCount: number;
  isAdminAuthenticated?: boolean;
  onNavigateSection: (sectionId: string) => void;
  onOpenLoginModal: () => void;
  onSwitchToAdminView?: () => void;
  currentView?: 'main' | 'admin';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenReservations,
  onOpenAIChat,
  reservationCount,
  isAdminAuthenticated = false,
  onNavigateSection,
  onOpenLoginModal,
  onSwitchToAdminView,
  currentView = 'main',
}) => {
  return (
    <header id="app-header" className="w-full bg-white/95 backdrop-blur-xs border-b-2 border-[#122B49] sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo: 8-point Starburst Icon + BIGBANG ENGLISH */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 group cursor-pointer text-left"
        >
          {/* 8-pointed starburst icon */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-[#122B49] group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8 fill-[#122B49]">
              <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" />
              <path d="M12 4L13 9L18 10L13 11L12 16L11 11L6 10L11 9L12 4Z" fill="#C59750" />
            </svg>
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black tracking-wider text-[#122B49] font-sans">
              BIGBANG ENGLISH
            </span>
            <span className="text-[10px] text-slate-500 block font-semibold -mt-1 hidden sm:block">
              초·중·고 내신 1등급 &amp; 수능 전문
            </span>
          </div>
        </button>

        {/* Navigation Links matching the reference image */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-bold text-slate-800">
          <button
            type="button"
            onClick={() => onNavigateSection('prep-2027')}
            className="flex items-center gap-1.5 text-[#C59750] hover:text-[#9A7338] transition cursor-pointer py-1 font-extrabold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C59750] animate-ping" />
            <span>2027 예비고1 진단</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('about')}
            className="hover:text-[#122B49] transition cursor-pointer py-1"
          >
            학원 소개
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('curriculum')}
            className="hover:text-[#122B49] transition cursor-pointer py-1"
          >
            커리큘럼
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('school-analysis')}
            className="hover:text-[#122B49] transition cursor-pointer py-1"
          >
            내신 분석
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('achievements')}
            className="hover:text-[#122B49] transition cursor-pointer py-1"
          >
            성적 향상 사례
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('reservation-card')}
            className="hover:text-[#122B49] transition cursor-pointer py-1"
          >
            상담 예약
          </button>
        </nav>

        {/* Action Buttons: AI 실시간 상담, 접수대장, 로그인 */}
        <div className="flex items-center gap-2">
          {/* AI 실시간 상담 Pill Button */}
          <button
            type="button"
            onClick={onOpenAIChat}
            className="hidden sm:flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#122B49] border border-blue-200 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-700 animate-pulse" />
            <span>AI 상담실장</span>
          </button>

          {/* Admin Reservation Drawer Trigger with Privacy Protection */}
          <button
            type="button"
            onClick={onOpenReservations}
            title={
              isAdminAuthenticated
                ? '상담 접수 대장 (원장 관리자 모드)'
                : '상담 접수 현황 (상세 내역은 원장/관리자 인증 전용)'
            }
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            {isAdminAuthenticated ? (
              <ShieldCheck className="w-3.5 h-3.5 text-[#C59750]" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="hidden sm:inline">접수 현황</span>
            <span className="bg-[#122B49] text-white text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold">
              {reservationCount}
            </span>
          </button>

          {/* Director Login/Admin Pill Button */}
          <button
            type="button"
            onClick={() => {
              if (isAdminAuthenticated) {
                if (onSwitchToAdminView) {
                  onSwitchToAdminView();
                } else {
                  onOpenReservations();
                }
              } else {
                onOpenLoginModal();
              }
            }}
            className={`border-2 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              isAdminAuthenticated
                ? currentView === 'admin'
                  ? 'border-[#C59750] bg-[#122B49] text-amber-300 shadow-xs'
                  : 'border-[#C59750] bg-amber-50/90 text-[#122B49] hover:bg-amber-100 shadow-2xs'
                : 'border-[#122B49] text-[#122B49] hover:bg-[#122B49] hover:text-white shadow-2xs'
            }`}
          >
            {isAdminAuthenticated ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#C59750]" />
                <span>{currentView === 'admin' ? '원장 모드' : '관리자 화면 전환'}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>로그인</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
