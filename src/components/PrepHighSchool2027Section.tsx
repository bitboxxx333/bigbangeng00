import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  Award, 
  FileText, 
  Phone, 
  MessageCircle,
  HelpCircle,
  TrendingUp,
  Target
} from 'lucide-react';
import { ACADEMY_INFO } from '../data/schools';

interface PrepHighSchool2027SectionProps {
  onOpenReservation: (preset?: { grade?: string; concern?: string; school?: string }) => void;
  onOpenAIChat: (prompt?: string) => void;
}

export const PrepHighSchool2027Section: React.FC<PrepHighSchool2027SectionProps> = ({
  onOpenReservation,
  onOpenAIChat,
}) => {
  const directorSmsUrl = `sms:${ACADEMY_INFO.directorPhone || '010-2006-7525'}?body=${encodeURIComponent(
    '[빅뱅영어학원] 2027 예비고1 고등영어 진단예약 신청합니다. (학생 이름 / 학교 / 희망일시)'
  )}`;

  return (
    <section id="prep-2027" className="w-full scroll-mt-24">
      {/* Container with High-impact Navy & Gold Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0D1E36] via-[#122B49] to-[#16365C] border-2 border-[#C59750]/60 p-6 sm:p-8 md:p-10 text-white shadow-xl overflow-hidden">
        {/* Subtle Decorative Background Starbursts */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C59750]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Top Header Badge */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-[#C59750] text-[#0D1E36] shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5 fill-[#0D1E36]" />
              HOT SPECIAL
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-300">
              2027학년도 고교 진학 대비 · 현 중3(예비고1) 특별 전형
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>원장 1:1 심층 진단평가 사전예약 접수 중</span>
          </div>
        </div>

        {/* Main Title & Hero Banner */}
        <div className="relative z-10 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-black tracking-wider uppercase text-[#C59750]">
              <span>BIGBANG 2027 PREP HIGH SCHOOL ENGLISH DIAGNOSIS</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
              2027 예비고1 고등영어 진단예약
            </h2>

            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed break-keep-all">
              <span className="text-amber-300 font-bold">"중등 영어 90점의 착각!"</span> 고등학교 첫 시험에서 4~5등급으로 떨어지는 결정적 이유는 
              교과서 암기를 넘어선 <strong className="text-white underline decoration-[#C59750] underline-offset-4">모의고사 변형 지문</strong>과 <strong className="text-white underline decoration-[#C59750] underline-offset-4">서술형 킬러 영작</strong> 때문입니다.
              고교 진학 전 학생의 진짜 고등 체급을 60분 무료 정밀 진단으로 확인하세요.
            </p>

            {/* Quick Bullet Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15">
                <div className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-[#C59750]" />
                  <span>진단 대상</span>
                </div>
                <div className="text-sm font-black text-white mt-0.5">
                  현 중3 (예비고1 전원)
                </div>
                <div className="text-[10px] text-slate-400">동인천고·숭덕여고·문일여고 外</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15">
                <div className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C59750]" />
                  <span>진단 소요</span>
                </div>
                <div className="text-sm font-black text-white mt-0.5">
                  60분 테스트 + 30분 상담
                </div>
                <div className="text-[10px] text-slate-400">원장 1:1 직접 성적 분석</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15">
                <div className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#C59750]" />
                  <span>진단 비용</span>
                </div>
                <div className="text-sm font-black text-emerald-400 mt-0.5">
                  사전 예약 전액 무료
                </div>
                <div className="text-[10px] text-slate-400">분석 리포트 &amp; 어휘집 증정</div>
              </div>
            </div>
          </div>

          {/* Right Action Callout Box */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/15">
              <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>예약 접수 일정</span>
              </div>
              <span className="text-[10px] bg-rose-500/80 text-white font-extrabold px-2 py-0.5 rounded-full">
                선착순 마감제
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">• 진단 기간:</span>
                <span className="font-bold text-white">상시 접수 (일정 조율)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">• 진단 장소:</span>
                <span className="font-bold text-white">빅뱅영어학원 3층</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">• 지참 서류:</span>
                <span className="font-bold text-white">최근 중등 영어 시험지</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() =>
                  onOpenReservation({
                    grade: '2027 예비고1 (현 중3)',
                    concern: '2027 예비고1 고등영어 진단예약 (고등 내신/서술형 진단)',
                  })
                }
                className="w-full bg-[#C59750] hover:bg-[#B58540] text-slate-950 font-black text-sm sm:text-base py-3.5 px-4 rounded-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
              >
                <span>2027 예비고1 진단예약 바로 신청</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={directorSmsUrl}
                  className="py-2.5 px-2 bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg transition flex items-center justify-center gap-1 text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  <span>원장 직통 문자</span>
                </a>
                <button
                  type="button"
                  onClick={() =>
                    onOpenAIChat('2027 예비고1 고등영어 진단예약 내용과 우리 아이에게 필요한 준비 과정을 알려주세요.')
                  }
                  className="py-2.5 px-2 bg-blue-600/40 hover:bg-blue-600/60 border border-blue-400/30 text-white font-bold rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI 상담실장 문의</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Diagnostic Pillars Grid */}
        <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h3 className="text-lg sm:text-xl font-black text-white">
              빅뱅 2027 예비고1 3대 정밀 진단 시스템
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              단순한 점수 확인이 아닌, 지망 고등학교(남고/여고/공학)별 내신 1등급 가능성을 시뮬레이션합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: 서술형 영작 & 어법 진단 */}
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C59750]/20 border border-[#C59750]/40 flex items-center justify-center text-[#C59750]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">DIAGNOSIS 01</span>
                <h4 className="text-base font-black text-white mt-0.5">
                  고등 서술형 영작 &amp; 킬러 어법 진단
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed break-keep-all">
                동인천고·숭덕여고·문일여고 등 관내 고교 5개년 킬러 문항을 토대로, 밑줄 없는 통문장 어법 찾기 및 조건 영작(어형 변화, 도치, 분사구문)의 부분 감점 취약점을 완벽 측정합니다.
              </p>
              <div className="pt-2 border-t border-white/10 text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>서술형 조건 영작 감점 요인 1:1 처방</span>
              </div>
            </div>

            {/* Card 2: 수능 모의고사 1등급 체급 */}
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-black text-blue-300 uppercase tracking-wider">DIAGNOSIS 02</span>
                <h4 className="text-base font-black text-white mt-0.5">
                  고1 3월 모의고사 및 수능 어휘 체력
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed break-keep-all">
                중등 단어와 완전히 다른 고등 필수 어휘(유의어·반의어·다의어)와 1등급을 가르는 빈칸 추론·문장 삽입·순서 배열의 구문 독해 속도와 논리력을 정밀하게 수치화합니다.
              </p>
              <div className="pt-2 border-t border-white/10 text-[11px] text-blue-200 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>고1 전국연합학력평가 1등급 도달 분석</span>
              </div>
            </div>

            {/* Card 3: 지망 고교별 내신 시뮬레이션 */}
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wider">DIAGNOSIS 03</span>
                <h4 className="text-base font-black text-white mt-0.5">
                  지망 고교 1등급 맞춤 로드맵
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed break-keep-all">
                진학 예정 학교의 교과서 및 수능형 부교재 출제 비중을 100% 매칭하여, 입학 전 겨울방학 동안 반드시 마스터해야 할 영역별 1:1 맞춤 액션 플랜을 제시합니다.
              </p>
              <div className="pt-2 border-t border-white/10 text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>원장 1:1 심층 결과 리포트 상담 제공</span>
              </div>
            </div>
          </div>
        </div>

        {/* Free Gifts / Reassurance Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 bg-black/20 p-4 rounded-xl text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-200">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              예약자 특별 혜택:
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C59750]" />
              만수동 6개 고교 5개년 기출 경향 분석집 증정
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C59750]" />
              예비고1 필수 고등 빈출 어휘 1,200선 워크북 증정
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C59750]" />
              원장 1:1 맞춤 로드맵 컨설팅 (30분)
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenReservation({
                grade: '2027 예비고1 (현 중3)',
                concern: '2027 예비고1 고등영어 진단예약 (고등 내신/서술형 진단)',
              })
            }
            className="text-amber-300 hover:text-white font-extrabold flex items-center gap-1 cursor-pointer transition underline underline-offset-2 ml-auto"
          >
            <span>지금 바로 진단예약 신청하기 &gt;</span>
          </button>
        </div>
      </div>
    </section>
  );
};
