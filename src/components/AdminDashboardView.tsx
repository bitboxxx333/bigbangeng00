import React, { useState, useEffect } from 'react';
import { Reservation, SchoolData } from '../types';
import { TARGET_SCHOOLS, ACADEMY_INFO } from '../data/schools';
import { 
  ShieldCheck, 
  LogOut, 
  ArrowLeft, 
  Calendar, 
  Phone, 
  User, 
  Clock, 
  Filter, 
  Download, 
  Settings, 
  Sparkles, 
  CheckCircle2, 
  MessageCircle, 
  ExternalLink, 
  Send, 
  Bell, 
  Save, 
  Search, 
  School,
  X,
  Smartphone,
  Eye
} from 'lucide-react';
import { getDirectSmsUrl } from '../utils/kakaoShare';

interface AdminDashboardViewProps {
  reservations: Reservation[];
  reservationCount: number;
  onLogout: () => void;
  onBackToMain: () => void;
  onUpdateStatus?: (id: string, newStatus: '접수완료' | '상담대기' | '확정') => void;
  showPrep2027Campaign: boolean;
  onTogglePrep2027Campaign: (enabled: boolean) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  reservations,
  reservationCount,
  onLogout,
  onBackToMain,
  onUpdateStatus,
  showPrep2027Campaign,
  onTogglePrep2027Campaign,
}) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'campaign' | 'notifications' | 'schools'>('reservations');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Notification Settings
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
  const [campaignSyncMsg, setCampaignSyncMsg] = useState('');

  const activePin = sessionStorage.getItem('bigbang_admin_pin') || '';

  useEffect(() => {
    fetch('/api/admin/settings', {
      headers: { 'x-admin-pin': activePin },
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
  }, [activePin]);

  // Filtered reservations
  const filtered = reservations.filter((r) => {
    const matchSchool = filterSchool === 'all' || r.school.includes(filterSchool);
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSearch =
      !searchQuery.trim() ||
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.parentPhone.includes(searchQuery) ||
      r.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.grade.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSchool && matchStatus && matchSearch;
  });

  const pendingCount = reservations.filter((r) => r.status === '상담대기').length;
  const completedCount = reservations.filter((r) => r.status === '접수완료').length;
  const confirmedCount = reservations.filter((r) => r.status === '확정').length;
  const prep2027Count = reservations.filter((r) => r.grade.includes('예비고1') || (r.notes && r.notes.includes('2027'))).length;

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

  const handleToggleCampaign = async () => {
    const nextVal = !showPrep2027Campaign;
    onTogglePrep2027Campaign(nextVal);
    setCampaignSyncMsg(
      nextVal
        ? '2027 예비고1 특별 섹션이 활성화되었습니다.'
        : '2027 예비고1 특별 섹션이 메인페이지에서 제외되었습니다.'
    );
    setTimeout(() => setCampaignSyncMsg(''), 4000);

    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': activePin,
        },
        body: JSON.stringify({ prep2027CampaignEnabled: nextVal }),
      });
    } catch (err) {
      console.error('Failed to sync campaign setting:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSaveMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': activePin,
        },
        body: JSON.stringify({
          kakaoOpenChatUrl: openChatUrl.trim(),
          autoOpenChatOnSubmit: autoOpenChat,
          notifyWebhookUrl: webhookUrl.trim(),
          telegramBotToken: telegramBotToken.trim(),
          telegramChatId: telegramChatId.trim(),
          directorMobile: directorMobile.trim(),
          kakaoJsKey: kakaoJsKey.trim(),
          prep2027CampaignEnabled: showPrep2027Campaign,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsSaveMsg('알림 및 학원 설정이 성공적으로 저장되었습니다!');
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

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    setTestNotificationFeedback('');
    try {
      const res = await fetch('/api/admin/test-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': activePin,
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Admin Control Bar */}
      <header className="bg-[#122B49] text-white border-b-2 border-[#C59750] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-[#C59750]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight">빅뱅영어학원</span>
                <span className="bg-[#C59750] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  원장 관리자 모드
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                만수동 11개교 내신 분석 및 1:1 상담 예약 관리 시스템
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Back to Homepage Button */}
            <button
              type="button"
              onClick={onBackToMain}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-amber-300" />
              <span>학부모 메인화면 보기</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs sm:text-sm px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 block">전체 실시간 접수</span>
            <div className="text-2xl font-black text-[#122B49] mt-1">{reservations.length}건</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-1">● 실시간 자동 동기화</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 block">상담 대기</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}건</div>
            <div className="text-[10px] text-slate-400 mt-1">확인 전화 필요</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 block">일정 확정 완료</span>
            <div className="text-2xl font-black text-blue-700 mt-1">{confirmedCount}건</div>
            <div className="text-[10px] text-slate-400 mt-1">진단테스트 예정</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 block">2027 예비고1 신청</span>
              <span className="text-[10px] bg-amber-100 text-[#845e23] font-black px-1.5 py-0.2 rounded-md">
                HOT
              </span>
            </div>
            <div className="text-2xl font-black text-[#C59750] mt-1">{prep2027Count}건</div>
            <div className="text-[10px] text-slate-400 mt-1">
              캠페인: {showPrep2027Campaign ? '🟢 노출 중' : '⚪ 숨김'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-1.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('reservations')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'reservations'
                ? 'bg-[#122B49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4 text-amber-300" />
            <span>상담 접수 대장 ({reservations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('campaign')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'campaign'
                ? 'bg-[#122B49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C59750]" />
            <span>시즌 캠페인 제어 (2027 예비고1)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-[#122B49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4 text-sky-400" />
            <span>자동 알림 미연결 · 오픈채팅 설정</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schools')}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'schools'
                ? 'bg-[#122B49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <School className="w-4 h-4 text-emerald-400" />
            <span>만수동 11개교 기출 DB</span>
          </button>
        </div>

        {/* Tab 1: Reservations Table */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Search Input */}
                <div className="relative min-w-[180px] max-w-xs flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="학생명, 연락처, 학교 검색"
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-[#122B49]"
                  />
                </div>

                {/* School Filter */}
                <select
                  value={filterSchool}
                  onChange={(e) => setFilterSchool(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs bg-white font-medium focus:outline-hidden"
                >
                  <option value="all">전체 학교 ({reservations.length})</option>
                  {TARGET_SCHOOLS.map((s) => (
                    <option key={s.id} value={s.badge}>
                      {s.badge}
                    </option>
                  ))}
                  <option value="기타">기타 학교</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs bg-white font-medium focus:outline-hidden"
                >
                  <option value="all">전체 상태</option>
                  <option value="접수완료">접수완료</option>
                  <option value="상담대기">상담대기</option>
                  <option value="확정">확정</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>엑셀(CSV) 다운로드</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <User className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-sm">조건에 맞는 상담 신청 내역이 없습니다.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">학생명 / 연락처</th>
                      <th className="py-3 px-4">학교 / 학년</th>
                      <th className="py-3 px-4">상담 희망 일시</th>
                      <th className="py-3 px-4">주요 학습 고민</th>
                      <th className="py-3 px-4">접수 상태</th>
                      <th className="py-3 px-4 text-right">빠른 연락</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((r) => {
                      const isPrep = r.grade.includes('예비고1') || (r.notes && r.notes.includes('2027'));
                      return (
                        <tr key={r.id} className="hover:bg-blue-50/40 transition">
                          <td className="py-3 px-4">
                            <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{r.studentName}</span>
                              {isPrep && (
                                <span className="bg-amber-100 text-[#845e23] text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                  예비고1
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <a href={`tel:${r.parentPhone}`} className="hover:underline text-blue-700 font-bold">
                                {r.parentPhone}
                              </a>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            <span className="font-bold text-[#122B49]">{r.school}</span>
                            <span className="text-slate-500 text-[11px] block">{r.grade}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              <span>{r.preferredDate}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{r.preferredTime}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="text-slate-800 line-clamp-2">
                              {(r.concerns || []).join(', ') || r.notes || '1:1 정밀 진단 및 상담 신청'}
                            </div>
                            {r.notes && (
                              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                메모: {r.notes}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {onUpdateStatus ? (
                              <select
                                value={r.status}
                                onChange={(e) => onUpdateStatus(r.id, e.target.value as any)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer ${
                                  r.status === '확정'
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : r.status === '상담대기'
                                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                }`}
                              >
                                <option value="접수완료">접수완료</option>
                                <option value="상담대기">상담대기</option>
                                <option value="확정">확정</option>
                              </select>
                            ) : (
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  r.status === '확정'
                                    ? 'bg-blue-100 text-blue-800'
                                    : r.status === '상담대기'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {r.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={getDirectSmsUrl(r, r.parentPhone)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                title="문자앱 열기 (수동)"
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`tel:${r.parentPhone}`}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                                title="전화 걸기"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Season Campaign Control */}
        {activeTab === 'campaign' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#122B49] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C59750]" />
                  <span>시즌 캠페인: 2027 예비고1 고등영어 진단예약</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  메인 화면의 '2027 예비고1' 전용 특별 섹션 및 진단 배너를 실시간 제어합니다.
                </p>
              </div>

              <span
                className={`text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-2 ${
                  showPrep2027Campaign
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    showPrep2027Campaign ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{showPrep2027Campaign ? '현재 메인페이지 노출 중 (활성)' : '메인페이지 제외됨 (숨김)'}</span>
              </span>
            </div>

            {/* Campaign Details Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500 block">시스템 자동 종료 설정</span>
                <div className="text-base font-black text-[#122B49]">
                  2027년 4월 30일 23:59:59 (자동 만료)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  💡 <strong>자동 만료 타이머</strong>: 2027년 4월 말일이 지나면 시스템 시계가 날짜를 인식하여 메인페이지에서 자동으로 숨김 처리되므로 원장님께서 별도로 신경 쓰실 필요가 없습니다.
                </p>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-2">
                <span className="text-xs font-bold text-amber-900 block">원클릭 즉시 제어</span>
                <div className="text-base font-black text-[#122B49]">
                  언제든 즉시 켜고 끄기 가능
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  아래 스위치 버튼을 누르시면 지금 당장 메인페이지에서 2027 예비고1 특별 섹션을 끄거나 다시 노출할 수 있습니다.
                </p>
              </div>
            </div>

            {campaignSyncMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{campaignSyncMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleToggleCampaign}
                className={`py-3 px-5 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 ${
                  showPrep2027Campaign
                    ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                    : 'bg-[#122B49] text-white hover:bg-[#1a385c]'
                }`}
              >
                {showPrep2027Campaign ? (
                  <>
                    <X className="w-4 h-4 text-rose-600" />
                    <span>지금 즉시 메인페이지에서 2027 예비고1 항목 제외하기</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>2027 예비고1 특별 섹션 다시 노출하기</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBackToMain}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>메인페이지 화면에서 직접 확인하기</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-200 shadow-2xs space-y-3">
            <h3 className="text-lg font-black text-[#122B49]">자동 문자 알림 미설정</h3>
            <p className="text-sm text-slate-700">상담 신청은 비공개 접수 대장에 저장됩니다. 원장님께 자동 문자나 푸시 알림은 아직 발송되지 않습니다. 새 접수는 이 관리자 화면에서 확인해 주세요.</p>
          </div>
        )}

        {/* Tab 4: School DB */}
        {activeTab === 'schools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TARGET_SCHOOLS.map((school) => (
              <div key={school.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-base text-[#122B49]">{school.name}</h4>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                    {school.type === 'high' ? '고등학교' : '중학교'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>• 교재: <span className="font-medium text-slate-800">{school.textbookInfo}</span></div>
                  <div>• 배점: <span className="font-medium text-slate-800">{school.examRatio}</span></div>
                  <div>• 1등급컷: <span className="font-bold text-blue-700">{school.gradeCutTrend}</span></div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">핵심 킬러 유형</span>
                  {school.killerPoints[0]}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
