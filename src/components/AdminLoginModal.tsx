import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, AlertCircle, Eye, EyeOff, X, ArrowRight } from 'lucide-react';
import { Reservation } from '../types';
import { AdminPasswordChangeForm } from './AdminPasswordChangeForm';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (reservations: Reservation[], pin: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPin = pinInput.trim();
    if (!trimmedPin) {
      setErrorMessage('관리자 비밀번호를 입력해 주세요.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: trimmedPin }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reservations)) {
          sessionStorage.setItem('bigbang_admin_pin', trimmedPin);
          sessionStorage.setItem('bb_admin_pin', trimmedPin);
          sessionStorage.setItem('bigbang_admin_auth', 'true');
          onLoginSuccess(data.reservations, trimmedPin);
          onClose();
          return;
        }
      }

      setErrorMessage('관리자 인증에 실패했습니다. 비밀번호를 확인해 주세요.');
    } catch {
      setErrorMessage('관리자 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-[#122B49] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">빅뱅영어학원 관리자 로그인</h3>
              <p className="text-[11px] text-slate-300">상담 접수 관리 &amp; 원장 모드</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {showChangePassword ? <AdminPasswordChangeForm onBack={() => setShowChangePassword(false)} /> : (
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6 text-[#C59750]" />
            </div>
            <h4 className="font-black text-slate-900 text-base">원장 관리자 인증</h4>
            <p className="text-xs text-slate-500 break-keep-all leading-relaxed">
              로그인하시면 학부모 상담 접수 대장 및 시즌 캠페인 제어 화면으로 즉시 전환됩니다.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              관리자 비밀번호
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-3.5 py-3 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#122B49] focus:border-[#122B49] pr-10 bg-slate-50/50"
                maxLength={128}
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium pt-0.5">
              ※ 등록된 학원 관리자 보안 비밀번호를 입력해 주세요.
            </p>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 bg-[#122B49] hover:bg-[#1a385c] text-white rounded-xl font-black text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 active:scale-[0.99]"
            >
              {isVerifying ? (
                <span>인증 확인 중...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#C59750]" />
                  <span>로그인 및 관리자 화면 전환</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button type="button" onClick={() => { setShowChangePassword(true); setErrorMessage(''); }} className="w-full py-2.5 text-[#122B49] font-bold text-xs underline">관리자 비밀번호 변경</button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              취소
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};