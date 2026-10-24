import React, { useState, useEffect } from 'react';
import { Reservation } from '../types';
import { ACADEMY_INFO } from '../data/schools';
import { AdminPasswordChangeForm } from './AdminPasswordChangeForm';
import { 
  X, 
  Calendar, 
  Phone, 
  User, 
  Clock, 
  Filter, 
  Download, 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  KeyRound, 
  LogOut,
  AlertCircle,
  Sparkles,
  School,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  Settings,
  Bell,
  Save,
  Check,
  Copy,
  Info,
  Send
} from 'lucide-react';

interface AdminReservationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  reservationCount: number;
  isAdminAuthenticated: boolean;
  onLoginSuccess: (reservations: Reservation[], pin: string) => void;
  onLogout: () => void;
  onUpdateStatus?: (id: string, newStatus: '접수완료' | '상담대기' | '확정') => void;
  showPrep2027Campaign?: boolean;
  onTogglePrep2027Campaign?: (enabled: boolean) => void;
}

export const AdminReservationDrawer: React.FC<AdminReservationDrawerProps> = ({
  isOpen,
  onClose,
  reservations,
  reservationCount,
  isAdminAuthenticated,
  onLoginSuccess,
  onLogout,
  onUpdateStatus,
  showPrep2027Campaign = true,
  onTogglePrep2027Campaign,
}) => {
  const [adminTab, setAdminTab] = useState<'list' | 'kakaoSettings'>('list');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pinInput, setPinInput] = useState('');
  const [activePin, setActivePin] = useState(() => sessionStorage.getItem('bb_admin_pin') || '');
  const [showPin, setShowPin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Notification Settings State
  const [openChatUrl, setOpenChatUrl] = useState(ACADEMY_INFO.kakaoChannelUrl);
  const [autoOpenChat, setAutoOpenChat] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [directorMobile, setDirectorMobile] = useState('010-2006-7525');
  const [kakaoJsKey, setKakaoJsKey] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testNotificationFeedback, setTestNotificationFeedback] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated) {
      const pinToUse = activePin;
      fetch('/api/admin/settings', {
        headers: { 'x-admin-pin': pinToUse },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            if (data.kakaoOpenChatUrl) setOpenChatUrl(data.kakaoOpenChatUrl);
            if (typeof data.autoOpenChatOnSubmit === 'boolean') setAutoOpenChat(data.autoOpenChatOnSubmit);
            if (data.notifyWebhookUrl) setWebhookUrl(data.notifyWebhookUrl);
            if (data.telegramBotToken) setTelegramBotToken(data.telegramBotToken);
            if (data.telegramChatId) setTelegramChatId(data.telegramChatId);
            if (data.directorMobile) setDirectorMobile(data.directorMobile);
            if (data.kakaoJsKey) setKakaoJsKey(data.kakaoJsKey);
          }
        })
        .catch(() => {});
    }
  }, [isAdminAuthenticated, activePin]);

  if (!isOpen) return null;

  const handleVerifyPin = async (e: React.FormEvent) => {
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
          setActivePin(trimmedPin);
          sessionStorage.setItem('bigbang_admin_pin', trimmedPin);
          sessionStorage.setItem('bb_admin_pin', trimmedPin);
          sessionStorage.setItem('bigbang_admin_auth', 'true');
          onLoginSuccess(data.reservations, trimmedPin);
          if (data.settings?.kakaoOpenChatUrl) {
            setOpenChatUrl(data.settings.kakaoOpenChatUrl);
          }
          setPinInput('');
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSaveMsg('');

    try {
      const pinToUse = activePin;
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pinToUse,
        },
        body: JSON.stringify({
          kakaoOpenChatUrl: openChatUrl.trim(),
          autoOpenChatOnSubmit: autoOpenChat,
          notifyWebhookUrl: webhookUrl.trim(),
          telegramBotToken: telegramBotToken.trim(),
          telegramChatId: telegramChatId.trim(),
          directorMobile: directorMobile.trim(),
          kakaoJsKey: kakaoJsKey.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsSaveMsg('스마트폰 실시간 자동 알림 설정이 성공적으로 저장되었습니다!');
        setTimeout(() => setSettingsSaveMsg(''), 4000);
      } else {
        setSettingsSaveMsg('저장 실패: ' + (data.error || '알 수 없는 오류'));
      }
    } catch {
      setSettingsSaveMsg('서버 통신 오류가 발생했습니다.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSendRealtimeTestNotification = async () => {
    setIsSendingTest(true);
    setTestNotificationFeedback('');
    try {
      const pinToUse = activePin;
      const res = await fetch('/api/admin/test-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pinToUse,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestNotificationFeedback(data.message || '테스트 알림이 전송되었습니다!');
      } else {
        setTestNotificationFeedback('전송 실패: ' + (data.error || '오류 발생'));
      }
    } catch {
      setTestNotificationFeedback('서버 통신 오류가 발생했습니다.');
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setTestNotificationFeedback(''), 5000);
    }
  };

  const [campaignSyncMsg, setCampaignSyncMsg] = useState('');

  const handleToggleCampaign = async () => {
    const nextVal = !showPrep2027Campaign;
    if (onTogglePrep2027Campaign) {
      onTogglePrep2027Campaign(nextVal);
    }
    setCampaignSyncMsg(
      nextVal
        ? '2027 예비고1 특별 섹션이 활성화되었습니다.'
        : '2027 예비고1 특별 섹션이 메인페이지에서 제외되었습니다.'
    );
    setTimeout(() => setCampaignSyncMsg(''), 4000);

    try {
      const pinToUse = activePin;
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pinToUse,
        },
        body: JSON.stringify({ prep2027CampaignEnabled: nextVal }),
      });
    } catch (err) {
      console.error('Failed to sync campaign setting:', err);
    }
  };

  const handleTestNotification = () => {
    const sampleMessage = `[빅뱅영어학원 상담예약 테스트 알림]\n` +
      `• 예약번호: BB-REV-TEST99\n` +
      `• 학생: 홍길동 (동인천고등학교 고1)\n` +
      `• 학부모 연락처: 010-1234-5678\n` +
      `• 방문 희망일시: 내일 18:00\n` +
      `• 주요 상담고민: 내신 서술형 영작 감점\n` +
      `• 학원위치: 인천 남동구 만수서로 62 제이제이스타프라자 3층\n` +
      `*원장님 실시간 스마트폰 자동 알림 연동 테스트`;

    navigator.clipboard.writeText(sampleMessage).then(() => {
      window.open(openChatUrl, '_blank');
    });
  };

  const filtered = reservations.filter((r) => {
    const matchSchool = filterSchool === 'all' || r.school.includes(filterSchool);
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSchool && matchStatus;
  });

  const handleExportCSV = () => {
    const headers = ['예약번호', '학생명', '연락처', '학교', '학년', '고민', '예약일자', '시간', '접수일시', '상태', '메모'];
    const rows = filtered.map((r) => [
      r.id,
      r.studentName,
      r.parentPhone,
      r.school,
      r.grade,
      `"${(r.concerns || []).join(', ')}"`,
      r.preferredDate,
      r.preferredTime,
      new Date(r.createdAt).toLocaleString('ko-KR'),
      r.status,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `빅뱅영어학원_상담예약대장_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 bg-[#122B49] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              {isAdminAuthenticated ? (
                <ShieldCheck className="w-5 h-5 text-[#C59750]" />
              ) : (
                <Lock className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  {isAdminAuthenticated
                    ? '빅뱅영어학원 상담 접수 대장 (관리자)'
                    : '상담 접수 현황 (보안 잠금)'}
                </h3>
                {isAdminAuthenticated ? (
                  <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    인증됨
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold bg-amber-400 text-[#122B49] px-2 py-0.5 rounded-full">
                    보안 보호
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                현재 실시간 상담 접수 누적: <strong className="text-amber-300">{reservationCount}건</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                title="관리자 로그아웃 및 화면 잠금"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">잠금</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Condition 1: UNAUTHENTICATED (Security Lock Screen) */}
        {!isAdminAuthenticated ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between bg-slate-50/50">
            <div className="space-y-6 max-w-md mx-auto w-full pt-4">
              {/* Privacy Notice Banner */}
              <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-base sm:text-lg font-black text-[#122B49]">
                  개인정보 보호를 위한 관리자 보안 잠금
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-keep-all">
                  상담을 신청하신 학생과 학부모님의 <strong>소중한 개인정보(성함, 연락처, 학습 고민 등)</strong>를 보호하기 위해, 접수된 세부 상담 내용은 <strong>원장 및 지정 관리자 인증</strong> 후에만 열람 가능합니다.
                </p>

                {/* Public Numbers Display */}
                <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-center justify-around">
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-slate-500">실시간 누적 접수</div>
                    <div className="text-2xl font-black text-[#122B49]">{reservationCount}건</div>
                  </div>
                  <div className="h-8 w-px bg-blue-200" />
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-slate-500">정보 보호 등급</div>
                    <div className="text-xs font-black text-emerald-700 flex items-center gap-1 justify-center mt-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>100% 암호화</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login or password change */}
              {showChangePassword ? <div className="bg-white rounded-2xl border-2 border-[#122B49]"><AdminPasswordChangeForm onBack={() => setShowChangePassword(false)} /></div> : (
              <form onSubmit={handleVerifyPin} className="bg-white p-6 rounded-2xl border-2 border-[#122B49] shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#122B49]">
                  <KeyRound className="w-4 h-4 text-[#C59750]" />
                  <span>원장 & 관리자 인증</span>
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
                      className="w-full px-3.5 py-3 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#122B49] pr-10 bg-slate-50/50"
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
                  <p className="text-[11px] text-slate-400 font-medium">
                    ※ 학원 관리자에게 부여된 보안 비밀번호를 입력해 주세요.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 bg-[#122B49] hover:bg-[#1a385c] text-white rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span>인증 확인 중...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#C59750]" />
                      <span>원장 인증 및 접수 대장 열람</span>
                    </>
                  )}
                </button>
              </form>
              )}
              {!showChangePassword && <button type="button" onClick={() => { setShowChangePassword(true); setErrorMessage(''); }} className="block mx-auto text-xs font-bold text-[#122B49] underline">관리자 비밀번호 변경</button>}
            </div>

            <div className="text-center text-[11px] text-slate-400 py-2">
              빅뱅영어학원 개인정보보호 관리 규정 준수
            </div>
          </div>
        ) : (
          /* Condition 2: AUTHENTICATED (Full Admin Reservation Table or Settings) */
          <>
            {/* Admin Sub Navigation: Tab 1 (Reservations) vs Tab 2 (Kakao Open Chat Notification Settings) */}
            <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setAdminTab('list')}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
                  adminTab === 'list'
                    ? 'border-[#122B49] text-[#122B49] bg-white shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>상담 접수 대장 ({reservations.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('kakaoSettings')}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
                  adminTab === 'kakaoSettings'
                    ? 'border-[#122B49] text-[#122B49] bg-white shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 fill-[#FEE500] text-[#371D1E]" />
                <span className="flex items-center gap-1">
                  <span>오픈채팅 알림 설정</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </span>
              </button>
            </div>

            {adminTab === 'kakaoSettings' ? (
              /* Smart Real-time Push Notification Settings Panel (Option B) */
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 text-xs text-slate-700">
                {/* Status Hero Card */}
                <div className="p-4 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-amber-50 border-2 border-[#122B49]/30 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#122B49] text-white flex items-center justify-center shadow-xs">
                        <Bell className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-[#122B49]">
                          자동 알림 미연결 안내
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          상담 신청은 비공개 접수 대장에 저장됩니다. 자동 알림은 아직 발송되지 않습니다.
                        </p>
                      </div>
                    </div>
                    <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      자동 알림 미설정
                    </span>
                  </div>
                </div>

                {/* Season Campaign Management: 2027 예비고1 고등영어 진단관 */}
                <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-[#C59750]" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-[#122B49]">
                          시즌 캠페인 관리: 2027 예비고1 고등영어 진단관
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          메인페이지의 예비고1 특별 섹션 및 진단 배너 노출 여부
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                        showPrep2027Campaign
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          showPrep2027Campaign ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      <span>{showPrep2027Campaign ? '현재 노출 중 (활성)' : '메인페이지 제외됨 (숨김)'}</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-slate-500">시스템 자동 만료 예정일</span>
                      <span className="font-bold text-[#122B49] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        2027년 4월 30일 23:59:59 (자동 종료)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                      💡 <strong>2027년 4월 이후 자동 처리</strong>: 2027년 4월 말일이 지나면 원장님이 코드를 직접 수정하지 않아도 시스템 시계 기준으로 <strong>메인페이지에서 2027 예비고1 특별 섹션과 배너가 자동으로 제외</strong>됩니다. 지금 미리 확인하시거나 필요 시 아래 버튼으로 즉시 켜고 끌 수도 있습니다.
                    </p>
                  </div>

                  {campaignSyncMsg && (
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600" />
                      <span>{campaignSyncMsg}</span>
                    </div>
                  )}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleToggleCampaign}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        showPrep2027Campaign
                          ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                          : 'bg-[#122B49] text-white hover:bg-[#1a385c]'
                      }`}
                    >
                      {showPrep2027Campaign ? (
                        <>
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          <span>지금 즉시 메인페이지에서 2027 예비고1 항목 제외하기 (미리보기)</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>2027 예비고1 특별 섹션 다시 노출하기</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Instant Push Test Box */}
                <div className="bg-white p-5 rounded-2xl border-2 border-amber-300/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-sm">
                      <Bell className="w-4 h-4 text-amber-600" />
                      <span>원장님 스마트폰 실시간 알림 테스트 발송</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    아래 버튼을 누르면 학부모가 상담을 신청했을 때와 동일하게 <strong>원장님의 등록된 스마트폰(텔레그램 또는 웹훅)으로 즉시 테스트 알림이 발송</strong>됩니다.
                  </p>

                  <button
                    type="button"
                    onClick={handleSendRealtimeTestNotification}
                    disabled={isSendingTest}
                    className="w-full py-2.5 bg-gradient-to-r from-[#122B49] to-[#1e4575] hover:from-[#183a63] hover:to-[#25528c] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isSendingTest ? '테스트 알림 전송 중...' : '원장님 스마트폰으로 테스트 알림 즉시 발송'}</span>
                  </button>

                  {testNotificationFeedback && (
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
                      <span>{testNotificationFeedback}</span>
                    </div>
                  )}
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-2">
                    <Settings className="w-4 h-4 text-[#122B49]" />
                    <span>스마트폰 실시간 수신처 설정</span>
                  </div>

                  {/* 1. Telegram Integration (100% Free, Instant Push with Sound) */}
                  <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-black">T</span>
                        <span>텔레그램 스마트폰 실시간 푸시 (100% 무료 / 가장 간편)</span>
                      </label>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                        추천 연동
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      스마트폰 텔레그램 앱으로 예약 접수 즉시 진동 및 "카톡"처럼 즉시 푸시 알림이 옵니다.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 block mb-1">텔레그램 봇 토큰 (Bot Token)</span>
                        <input
                          type="text"
                          value={telegramBotToken}
                          onChange={(e) => setTelegramBotToken(e.target.value)}
                          placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWx..."
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:outline-none focus:border-[#122B49]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 block mb-1">원장님 Chat ID (숫자)</span>
                        <input
                          type="text"
                          value={telegramChatId}
                          onChange={(e) => setTelegramChatId(e.target.value)}
                          placeholder="987654321"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:outline-none focus:border-[#122B49]"
                        />
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-200 space-y-0.5 leading-relaxed">
                      💡 <strong>1분 설정법</strong>: 텔레그램에서 <code>@BotFather</code> 검색 후 <code>/newbot</code> 입력하여 토큰 발급 ➔ <code>@userinfobot</code> 검색하여 내 Chat ID 확인 후 위 칸에 입력.
                    </div>
                  </div>

                  {/* 2. Webhook Integration (Slack / Discord / External SMS) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block text-xs">
                      외부 웹훅 URL (Slack / Discord / 알림톡 웹훅)
                    </label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/... 또는 Slack Webhook URL"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-[#122B49] bg-slate-50"
                    />
                    <p className="text-[11px] text-slate-500">
                      ※ 슬랙이나 디스코드 채널로 알림을 받고 싶으신 경우 웹훅 URL을 입력하세요.
                    </p>
                  </div>

                  {/* 3. Director Mobile Phone Number (For 1-Tap Direct SMS) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block text-xs">
                      원장님 스마트폰 번호 (학부모 1-터치 문자 수신용)
                    </label>
                    <input
                      type="tel"
                      value={directorMobile}
                      onChange={(e) => setDirectorMobile(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#122B49] bg-slate-50"
                    />
                    <p className="text-[11px] text-slate-500">
                      ※ 학부모가 예약 완료 후 [문자(SMS)로 전송]을 누르면 원장님 번호로 예약 내용이 바로 채워집니다.
                    </p>
                  </div>

                  {/* 4. Kakao Open Chat URL (For direct parent inquiry) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block text-xs">
                      학원 공식 카카오톡 1:1 오픈채팅방 URL (새 주소 생성 시 언제든 변경 가능)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={openChatUrl}
                        onChange={(e) => setOpenChatUrl(e.target.value)}
                        placeholder="https://open.kakao.com/o/xxxxxx"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#122B49] bg-slate-50"
                        required
                      />
                      <a
                        href={openChatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1 text-xs shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>확인</span>
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      ※ 추후 새 오픈채팅방 주소를 만드셨을 때 여기에 새 링크를 넣고 아래 [저장하기]를 누르시면 학부모 화면에 즉시 적용됩니다.
                    </p>
                  </div>

                  {/* 5. Kakao JavaScript App Key (Optional: for custom Kakao Share app) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block text-xs">
                      카카오 JavaScript 키 (선택 사항: 카카오 개발자센터 발급 앱 키)
                    </label>
                    <input
                      type="text"
                      value={kakaoJsKey}
                      onChange={(e) => setKakaoJsKey(e.target.value)}
                      placeholder="기본 제공 키가 자동 적용되어 있으므로 비워두셔도 정상 작동합니다."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#122B49] bg-slate-50"
                    />
                  </div>

                  {settingsSaveMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{settingsSaveMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="w-full py-2.5 bg-[#122B49] hover:bg-[#1a385c] text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingSettings ? '저장 중...' : '알림 설정 저장하기'}</span>
                  </button>
                </form>

                {/* Director Smartphone Setup Guide */}
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-950 font-bold text-xs">
                    <Info className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>원장님 실시간 상담 알림 안내</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 font-medium pl-1 leading-relaxed">
                    <li>학부모가 웹사이트에서 이름과 연락처를 남기고 <strong>[상담 예약 완료]</strong>를 누릅니다.</li>
                    <li>자동 알림은 아직 연결되지 않았습니다. 새 접수는 관리자 화면에서 확인해 주세요.</li>
                    <li>원장님 휴대폰에 학생 이름, 학교, 학년, 연락처, 고민 내역이 즉시 푸시 알림으로 표시됩니다.</li>
                    <li>알림을 확인하신 뒤 학부모님께 편하신 시간에 확인 전화를 드리면 상담 접수가 신속하게 완료됩니다!</li>
                  </ol>
                </div>
              </div>
            ) : (
              /* Tab 1: Full Admin Reservation Table */
              <>
                {/* Filter & Action Toolbar */}
            <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={filterSchool}
                    onChange={(e) => setFilterSchool(e.target.value)}
                    className="border border-slate-300 rounded-md px-2 py-1 text-xs bg-white text-slate-800 font-medium cursor-pointer"
                  >
                    <option value="all">전체 학교 ({reservations.length})</option>
                    <option value="동인천">동인천고</option>
                    <option value="숭덕">숭덕여고</option>
                    <option value="문일">문일여고</option>
                    <option value="만수고">만수고</option>
                    <option value="인제">인제고</option>
                    <option value="신명">신명여고</option>
                    <option value="만수북">만수북중</option>
                    <option value="만수여중">만수여중</option>
                    <option value="만수중">만수중</option>
                    <option value="간석">간석여중</option>
                    <option value="정각">정각중</option>
                  </select>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-slate-300 rounded-md px-2 py-1 text-xs bg-white text-slate-800 font-medium cursor-pointer"
                >
                  <option value="all">전체 상태</option>
                  <option value="접수완료">접수완료</option>
                  <option value="상담대기">상담대기</option>
                  <option value="확정">확정</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-md transition cursor-pointer text-xs shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#122B49]" />
                <span>엑셀(CSV) 저장</span>
              </button>
            </div>

            {/* List of Reservations with Detailed Contacts */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                  <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                  <p>조건에 맞는 상담 접수 내역이 없습니다.</p>
                </div>
              ) : (
                filtered.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 border border-slate-200 rounded-xl bg-white shadow-2xs hover:border-[#122B49] transition text-xs space-y-2.5"
                  >
                    {/* Top Row: Name, School/Grade, and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                          <User className="w-4 h-4 text-[#122B49]" />
                          {res.studentName} 학생
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {res.school} {res.grade}
                        </span>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdateStatus) {
                            const nextStatus =
                              res.status === '접수완료'
                                ? '상담대기'
                                : res.status === '상담대기'
                                ? '확정'
                                : '접수완료';
                            onUpdateStatus(res.id, nextStatus);
                          }
                        }}
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full cursor-pointer transition flex items-center gap-1 ${
                          res.status === '확정'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : res.status === '상담대기'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="클릭하여 상담 상태 변경 (접수완료 → 상담대기 → 확정)"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{res.status}</span>
                      </button>
                    </div>

                    {/* Contact & Preferred Time Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#C59750] shrink-0" />
                        <span className="text-[11px] text-slate-500">연락처:</span>
                        <a
                          href={`tel:${res.parentPhone}`}
                          className="font-bold text-[#122B49] hover:underline"
                        >
                          {res.parentPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span className="text-[11px] text-slate-500">희망일시:</span>
                        <span className="text-blue-900 font-bold">
                          {res.preferredDate} {res.preferredTime}
                        </span>
                      </div>
                    </div>

                    {/* Concerns Tags */}
                    {res.concerns && res.concerns.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {res.concerns.map((c, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-bold"
                          >
                            #{c}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes if provided */}
                    {res.notes && (
                      <div className="text-xs text-slate-700 bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg leading-relaxed">
                        <strong className="text-amber-900 block text-[11px] mb-0.5">💬 학부모/학생 남김말:</strong>
                        {res.notes}
                      </div>
                    )}

                    {/* Kakao notification status indicator */}
                    <div className="flex items-center justify-between gap-2 p-2 bg-[#FEE500]/20 border border-[#FEE500]/60 rounded-lg text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <MessageCircle className="w-3.5 h-3.5 text-[#371D1E] fill-[#371D1E]" />
                        <span className="font-bold">원장님 카톡 알림:</span>
                        <span className="text-emerald-700 font-extrabold">전송 완료</span>
                      </div>
                      <a
                        href={ACADEMY_INFO.kakaoChannelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#371D1E] font-black underline flex items-center gap-0.5 hover:text-black"
                      >
                        <span>오픈채팅방 열기</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    {/* Footer receipt info */}
                    <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                      <span>접수번호: {res.id}</span>
                      <span>접수일시: {new Date(res.createdAt).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </>
    )}
  </div>
</div>
  );
};
