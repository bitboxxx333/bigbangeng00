import React, { useState } from 'react';

type Props = { onBack: () => void };

export const AdminPasswordChangeForm: React.FC<Props> = ({ onBack }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (newPassword !== confirmation) return setMessage('새 비밀번호 확인이 일치하지 않습니다.');
    const categoryCount = Number(/[A-Za-z]/.test(newPassword)) + Number(/[0-9]/.test(newPassword)) + Number(/[\p{P}\p{S}]/u.test(newPassword));
    if (newPassword.length < 8 || newPassword.length > 128 || newPassword !== newPassword.trim() || categoryCount < 2) {
      return setMessage('8~128자이며 영문·숫자·특수문자 중 2종류 이상을 포함해 주세요.');
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setMessage(data.error || '변경에 실패했습니다. 다시 시도해 주세요.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      sessionStorage.removeItem('bigbang_admin_pin');
      sessionStorage.removeItem('bb_admin_pin');
      sessionStorage.removeItem('bigbang_admin_auth');
      setSuccess(true);
      setMessage('비밀번호가 변경되었습니다. 저장된 비밀번호도 업데이트하고 새 비밀번호로 로그인해 주세요.');
    } catch {
      setMessage('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-6 space-y-4" autoComplete="on">
      <div>
        <h4 className="font-black text-slate-900 text-base">관리자 비밀번호 변경</h4>
        <p className="text-xs text-slate-600 mt-1">현재 비밀번호 확인이 필요합니다. 비밀번호를 모르면 이 화면에서 재설정할 수 없습니다.</p>
      </div>
      {!success && <>
        <label className="block text-xs font-bold text-slate-700">현재 비밀번호
          <input type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required maxLength={128} className="mt-1 w-full px-3.5 py-3 border border-slate-300 rounded-xl text-sm" />
        </label>
        <label className="block text-xs font-bold text-slate-700">새 비밀번호
          <input type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} maxLength={128} className="mt-1 w-full px-3.5 py-3 border border-slate-300 rounded-xl text-sm" />
        </label>
        <label className="block text-xs font-bold text-slate-700">새 비밀번호 확인
          <input type="password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required minLength={8} maxLength={128} className="mt-1 w-full px-3.5 py-3 border border-slate-300 rounded-xl text-sm" />
        </label>
        <p className="text-[11px] text-slate-500">8자 이상, 영문·숫자·특수문자 중 2종류 이상. 4자리 PIN은 사용할 수 없습니다.</p>
      </>}
      {message && <p role="status" className={success ? 'text-sm font-bold text-emerald-700' : 'text-sm font-bold text-rose-700'}>{message}</p>}
      {!success && <button type="submit" disabled={isSaving} className="w-full py-3 bg-[#122B49] text-white rounded-xl font-bold text-sm disabled:opacity-50">{isSaving ? '변경 저장 중...' : '비밀번호 변경'}</button>}
      <button type="button" onClick={onBack} className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs">로그인으로 돌아가기</button>
    </form>
  );
};