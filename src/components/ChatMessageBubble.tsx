import React, { useState } from 'react';
import { ChatMessage, SchoolData } from '../types';
import { Volume2, VolumeX, Sparkles, User, CalendarPlus, ChevronRight, School, AlertCircle, FileText, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSelectQuickReply?: (reply: string) => void;
  onOpenReservationModal?: () => void;
  onViewSchoolDetail?: (school: SchoolData) => void;
  onOpenDiagnosticReport?: () => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onSelectQuickReply,
  onOpenReservationModal,
  onViewSchoolDetail,
  onOpenDiagnosticReport,
}) => {
  const isAI = message.sender === 'ai';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('브라우저에서 음성 안내를 지원하지 않습니다.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown characters for clearer speech
    const cleanText = message.text.replace(/[*#_`]/g, '').replace(/💡|🎯|⚠️|✓|😊|📝|✨/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Helper to format text with bold, lists, and line alignment
  const renderInlineFormatted = (rawText: string) => {
    const parts = rawText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={partIdx} className="font-bold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderFormattedText = (text: string) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((para, pIdx) => {
      const rawLines = para.split('\n');

      return (
        <div key={pIdx} className="mb-2.5 last:mb-0 space-y-1.5 text-left break-keep-all">
          {rawLines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            // Check if bullet point (- , * , • )
            const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
            if (bulletMatch) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-0.5 leading-relaxed">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-2.5" />
                  <span className="flex-1 min-w-0">{renderInlineFormatted(bulletMatch[1])}</span>
                </div>
              );
            }

            // Check if numbered list (e.g. "1. ", "2. ")
            const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
            if (numMatch) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-0.5 leading-relaxed">
                  <span className="shrink-0 font-bold text-blue-900 text-xs mt-0.5 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md">
                    {numMatch[1]}
                  </span>
                  <span className="flex-1 min-w-0">{renderInlineFormatted(numMatch[2])}</span>
                </div>
              );
            }

            // Check if stage tag e.g. "[1단계: ...]"
            if (trimmed.startsWith('[') && trimmed.includes(']')) {
              return (
                <div key={lIdx} className="py-1">
                  <span className="inline-block bg-blue-50 border border-blue-200 text-[#0F2A4A] text-xs font-bold px-2 py-0.5 rounded-md">
                    {renderInlineFormatted(trimmed)}
                  </span>
                </div>
              );
            }

            // Standard line
            return (
              <p key={lIdx} className="leading-relaxed break-keep-all">
                {renderInlineFormatted(trimmed)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 mb-4.5 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      {/* AI Avatar */}
      {isAI && (
        <div className="w-9 h-9 rounded-xl bg-[#0F2A4A] text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-blue-100/80 mt-0.5">
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
      )}

      {/* Bubble Container */}
      <div className={`max-w-[88%] md:max-w-[78%] ${isAI ? 'text-slate-800' : 'text-white'}`}>
        {/* Author & Timestamp bar */}
        <div className={`flex items-center gap-1.5 mb-1.5 text-[11px] ${isAI ? 'text-slate-500' : 'text-slate-400 justify-end'}`}>
          <span className="font-bold text-slate-800">
            {isAI ? '빅뱅 AI 상담실장' : '학생/학부모'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{message.timestamp}</span>
          {isAI && (
            <button
              type="button"
              onClick={handleSpeak}
              title={isSpeaking ? '음성 중지' : '음성으로 듣기'}
              className="ml-1 p-1 text-slate-400 hover:text-blue-700 transition cursor-pointer rounded hover:bg-slate-100"
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5 text-blue-700 animate-pulse" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Message Card */}
        <div
          className={`p-4 sm:p-4.5 rounded-2xl shadow-xs text-xs sm:text-sm leading-relaxed ${
            isAI
              ? 'bg-white border border-slate-200/90 rounded-tl-sm text-slate-800 shadow-slate-200/40'
              : 'bg-blue-700 text-white rounded-tr-sm shadow-sm shadow-blue-700/20'
          }`}
        >
          {renderFormattedText(message.text)}

          {/* Attached School Card if mentioned */}
          {message.schoolData && (
            <div className="mt-3.5 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-slate-800">
              <div className="flex items-start justify-between gap-2 font-bold text-[#0F2A4A] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <School className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>{message.schoolData.name} 기출 핵심 요약</span>
                </span>
                {onViewSchoolDetail && (
                  <button
                    type="button"
                    onClick={() => onViewSchoolDetail(message.schoolData!)}
                    className="text-[11px] text-blue-700 hover:text-blue-900 flex items-center gap-0.5 cursor-pointer font-bold shrink-0 hover:underline"
                  >
                    <span>상세보기</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-slate-700 font-medium leading-relaxed break-keep-all pl-5.5">
                {message.schoolData.targetFocus}
              </p>
            </div>
          )}

              {/* Diagnostic Report PDF Download Card */}
              {isAI && (message.stage && message.stage >= 3 || message.showReservationForm) && onOpenDiagnosticReport && (
                <div className="mt-3 p-3.5 bg-gradient-to-r from-amber-50/90 to-yellow-50/80 border border-amber-200/90 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-[#122B49] text-[#C59750] rounded-xl shrink-0 shadow-2xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-black text-xs text-amber-950">
                          1:1 맞춤 진단 리포트 요약본 발급 완료
                        </h5>
                        <span className="text-[10px] bg-[#122B49] text-[#C59750] font-black px-1.5 py-0.2 rounded-xs">
                          PDF
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900/80 leading-snug mt-0.5">
                        분석된 학교별 기출 킬러 포인트와 빅뱅영어 맞춤 솔루션을 PDF로 저장하세요.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenDiagnosticReport}
                    className="shrink-0 w-full sm:w-auto px-3.5 py-2 bg-[#122B49] hover:bg-[#1a385c] text-white rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C59750]" />
                    <span>진단 리포트 PDF 다운로드</span>
                  </button>
                </div>
              )}

              {/* Direct CTA card in chat for Stage 4 */}
              {isAI && message.showReservationForm && onOpenReservationModal && (
            <div className="mt-3.5 pt-3.5 border-t border-slate-100">
              <div className="bg-gradient-to-br from-blue-50/80 to-amber-50/40 border border-blue-200/80 rounded-xl p-3.5">
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="p-2 bg-[#0F2A4A] text-white rounded-xl shrink-0 shadow-2xs">
                    <CalendarPlus className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#0F2A4A] text-xs leading-snug break-keep-all">
                      [만수동 맞춤] 무료 1:1 정밀 레벨테스트 & 컨설팅 신청
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed break-keep-all">
                      소요 시간 약 60분 • 어휘/문법/독해 취약점 정밀 분석 성적표 당일 즉시 발급
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenReservationModal}
                  className="w-full py-2.5 bg-[#0F2A4A] hover:bg-[#183a63] text-white font-bold rounded-lg text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>30초 만에 간편 예약 신청하기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips attached to this AI message */}
        {isAI && message.suggestedQuickReplies && message.suggestedQuickReplies.length > 0 && onSelectQuickReply && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {message.suggestedQuickReplies.map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectQuickReply(reply)}
                className="text-xs bg-white hover:bg-blue-50 hover:text-blue-900 text-slate-700 font-semibold px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 transition cursor-pointer flex items-center gap-1.5 shadow-2xs break-keep-all text-left"
              >
                <span>{reply}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAI && (
        <div className="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
};
