import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Award, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Compass,
  FileCheck,
  ChevronRight,
  School,
  Building,
  GraduationCap,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { ACADEMY_INFO } from '../data/schools';

interface AcademyIntroSectionProps {
  onOpenAIChat?: () => void;
  onOpenReservation?: () => void;
}

export const AcademyIntroSection: React.FC<AcademyIntroSectionProps> = ({
  onOpenAIChat,
  onOpenReservation,
}) => {
  const [activeTab, setActiveTab] = useState<'philosophy' | 'system' | 'facility'>('philosophy');

  const corePillars = [
    {
      id: 'pillar-1',
      title: '구조 중심 구문 독해',
      subtitle: '단순 암기 탈피 • 문장 성분 꿰뚫기',
      desc: '단순히 본문을 억지로 통암기하면 시험 지문이 변형될 때 무너집니다. 주어·동사·수식어의 뼈대를 파악하는 구문 분석력으로 낯선 지문도 거침없이 해석해냅니다.',
      icon: Compass,
      tags: ['문장성분 분석', '수능형 독해력', '변형 지문 즉각 대응']
    },
    {
      id: 'pillar-2',
      title: '1:1 대면 무감점 서술형 첨삭',
      subtitle: '원장 & 전담 강사 1:1 직강 첨삭',
      desc: '알바 조교가 아닌 담당 강사가 학생 옆에서 직접 채점합니다. 수일치, 시제, 관사, 조건 영작 등 단 1점의 미세 감점 요인까지 집요하게 훈련하여 만점을 완성합니다.',
      icon: Target,
      tags: ['조교 첨삭 NO', '조건 영작 10대 패턴', '무감점 100점 완성']
    },
    {
      id: 'pillar-3',
      title: '만수동 11개교 5개년 기출 DB',
      subtitle: '학교별 부교재·학습지 100% 적중 변형',
      desc: '동인천고·숭덕여고·문일여고·만수고·인제고·신명여고 및 만수북중·만수중·만수여중·간석여중·정각중의 5개년 출제 경향을 전수 분석하여 자체 적중 워크북을 제공합니다.',
      icon: School,
      tags: ['부교재 완벽 변형', '학습지 전 문항 수거', '실전 족보 3회독']
    }
  ];

  const managementSteps = [
    {
      step: '01',
      title: '정밀 레벨테스트 & 취약점 진단',
      desc: '어휘·문법·독해·영작 4대 영역의 결손을 정밀 측정하고 1:1 맞춤 학습 처방전을 수립합니다.'
    },
    {
      step: '02',
      title: '소수정예 밀착 맞춤 수업',
      desc: '학교별·수준별 정원 제한 반편성을 통해 질문을 놓치지 않는 완전 이해 중심 강의를 진행합니다.'
    },
    {
      step: '03',
      title: '일일 누적 단어 & 타임어택 훈련',
      desc: '시험 직전 불안감을 없애기 위해 실제 시험과 동일한 OMR 타임어택 및 불통과 시 당일 1:1 재시험을 진행합니다.'
    },
    {
      step: '04',
      title: '학부모 안심 리포트 & 결석 클리닉',
      desc: '매주 학습 성취도 및 단어 테스트 결과를 알림 발송하며, 결석이나 취약 파트는 당일 1:1 보충 클리닉으로 메웁니다.'
    }
  ];

  return (
    <section id="about" className="w-full py-4 sm:py-6 scroll-mt-20">
      <div className="bg-white rounded-2xl border-2 border-[#122B49] shadow-sm overflow-hidden">
        {/* Top Header Accent Banner */}
        <div className="bg-[#122B49] text-white p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3a5f] border border-[#C59750]/40 text-xs font-bold text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-[#C59750]" />
                <span>ABOUT BIGBANG ENGLISH</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                단순 암기를 넘어,<br className="sm:hidden" />
                문장의 원리를 꿰뚫는 영어
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                인천 남동구 만수동에서만 축적된 10년 이상의 내신 출제진 분석 노하우와 
                1:1 밀착 관리로 흔들림 없는 1등급 영어 체급을 완성합니다.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex sm:flex-row md:flex-col gap-2.5 shrink-0">
              <div className="bg-[#193557] border border-blue-400/20 rounded-xl px-4 py-2.5 text-center min-w-[120px]">
                <div className="text-lg sm:text-xl font-black text-[#C59750]">11개교</div>
                <div className="text-[11px] text-slate-300 font-medium">만수동·인근 기출 DB</div>
              </div>
              <div className="bg-[#193557] border border-blue-400/20 rounded-xl px-4 py-2.5 text-center min-w-[120px]">
                <div className="text-lg sm:text-xl font-black text-[#C59750]">96.4%</div>
                <div className="text-[11px] text-slate-300 font-medium">재원생 성적 향상률</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('philosophy')}
              className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'philosophy'
                  ? 'bg-white text-[#122B49] shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              3대 교육 철학
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'system'
                  ? 'bg-white text-[#122B49] shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              4단계 밀착 관리 시스템
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('facility')}
              className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'facility'
                  ? 'bg-white text-[#122B49] shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              학습 환경 & 찾아오시는 길
            </button>
          </div>
        </div>

        {/* Tab 1: 3대 핵심 교육 철학 */}
        {activeTab === 'philosophy' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {corePillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.id}
                    className="bg-slate-50/80 rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-[#122B49] hover:bg-white hover:shadow-xs transition duration-200"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#122B49] text-white flex items-center justify-center mb-4 shadow-xs">
                        <Icon className="w-6 h-6 text-[#C59750]" />
                      </div>
                      <h3 className="text-lg font-black text-[#122B49] tracking-tight mb-1">
                        {pillar.title}
                      </h3>
                      <div className="text-xs font-bold text-[#C59750] mb-3">
                        {pillar.subtitle}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                      {pillar.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Director's Quote Box */}
            <div className="p-5 sm:p-6 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-black text-[#122B49] uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#C59750]" />
                  <span>빅뱅영어학원 대표원장 메시지</span>
                </div>
                <p className="text-sm font-bold text-slate-800 leading-snug break-keep-all">
                  "외운 문장은 시험 끝나면 잊히지만, 문장의 원리를 꿰뚫은 실력은 고등 내신과 수능까지 끝까지 살아남습니다."
                </p>
                <p className="text-xs text-slate-600">
                  영어가 어렵고 막막했던 4~5등급 학생도 올바른 공부법과 1:1 관리를 만나면 반드시 1등급이 됩니다.
                </p>
              </div>

              {onOpenAIChat && (
                <button
                  type="button"
                  onClick={onOpenAIChat}
                  className="px-4 py-2.5 rounded-xl bg-[#122B49] text-white font-bold text-xs hover:bg-[#1a385c] transition cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C59750]" />
                  <span>우리 아이 맞춤 진단받기</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: 4단계 밀착 관리 시스템 */}
        {activeTab === 'system' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {managementSteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-slate-50/90 rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-[#122B49] transition"
                >
                  <div>
                    <div className="text-2xl font-black text-[#C59750] mb-2 font-mono">
                      {step.step}
                    </div>
                    <h3 className="text-base font-black text-[#122B49] mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 flex items-center gap-1 text-[11px] font-bold text-blue-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                    <span>완벽 이해 시까지 무제한 관리</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Routine Summary */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 sm:p-5">
              <h4 className="text-xs sm:text-sm font-black text-[#122B49] mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>빅뱅영어 재원생의 하루 학습 루틴</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 font-medium">
                <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                  <span className="font-bold text-[#122B49] block">1. 등원 및 일일 보카</span>
                  <span>누적 단어 50~100개 테스트 및 오답 노트 즉시 작성</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                  <span className="font-bold text-[#122B49] block">2. 집중 강의 & 구문 독해</span>
                  <span>핵심 문법 개념 적용 및 실전 모의고사 지문 분해</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                  <span className="font-bold text-[#122B49] block">3. 1:1 대면 서술형 첨삭</span>
                  <span>서술형 조건 영작 확인 및 당일 과제 완성 후 하원</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 학습 환경 & 찾아오시는 길 */}
        {activeTab === 'facility' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Facilities Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-[#122B49] flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#C59750]" />
                  <span>빅뱅영어 학습 환경 & 시설</span>
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-[#122B49] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-700" />
                      <span>소수정예 스마트 강의실</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      전자칠판 및 빔프로젝터를 활용한 실시간 지문 분석, 질문이 편안한 6~8인 소수정예 배치
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-[#122B49] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      <span>1인 몰입형 프리미엄 스터디 라운지</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      수업 전후 및 주말 자습을 위한 지정석 자습 공간, 공기청정 및 백색소음 시스템 완비
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-[#122B49] flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-700" />
                      <span>상시 1:1 개별 클리닉실</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      오답 정리, 서술형 1:1 대면 첨삭, 취약 단원 보충 전용 독립 상담 클리닉 룸 운영
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Location & Operating Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-[#122B49] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C59750]" />
                  <span>학원 위치 및 운영 안내</span>
                </h3>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#C59750] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm block">학원 위치</span>
                      <span className="text-slate-700 text-xs font-semibold leading-relaxed">
                        {ACADEMY_INFO.location}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        (포레시안APT 정문 앞 / 동인천고, 숭덕여중고 인근)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-3 border-t border-slate-200">
                    <Phone className="w-4 h-4 text-[#C59750] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm block">대표 상담 전화</span>
                      <a 
                        href={`tel:${ACADEMY_INFO.phone}`} 
                        className="text-[#122B49] font-black text-sm hover:underline"
                      >
                        {ACADEMY_INFO.phone}
                      </a>
                      <span className="text-[11px] text-slate-500 block">수업 중일 경우 상담 예약 접수 후 순차 회신드립니다.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-3 border-t border-slate-200">
                    <Clock className="w-4 h-4 text-[#C59750] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm block mb-1">운영 시간</span>
                      <div className="text-xs text-slate-600 space-y-1 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-8 font-bold text-slate-800 shrink-0">평일</span>
                          <span className="inline-block w-[88px] tabular-nums">14:00 ~ 23:00</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-8 font-bold text-slate-800 shrink-0">주말</span>
                          <span className="inline-block w-[88px] tabular-nums">10:00 ~ 19:00</span>
                          <span className="text-[11px] text-slate-500 hidden sm:inline">(내신 직전 파이널 집중 클리닉)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 sm:hidden">※ 주말: 내신 직전 파이널 집중 클리닉</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {onOpenReservation && (
                    <button
                      type="button"
                      onClick={onOpenReservation}
                      className="w-full py-3 bg-[#122B49] text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-[#1a385c] transition cursor-pointer shadow-xs text-center flex items-center justify-center gap-2"
                    >
                      <span>무료 1:1 레벨테스트 및 방문 상담 신청하기</span>
                      <ChevronRight className="w-4 h-4 text-[#C59750]" />
                    </button>
                  )}
                  <a
                    href={ACADEMY_INFO.kakaoChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#FEE500] hover:bg-[#fedb00] text-[#191919] rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs text-center flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-[#191919]" />
                    <span>카카오톡 1:1 오픈채팅으로 문의하기</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
