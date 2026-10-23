import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, RotateCcw, CalendarCheck, School, FileText, Download } from 'lucide-react';
import { ChatMessageBubble } from './ChatMessageBubble';
import { QuickActionToolbar } from './QuickActionToolbar';
import { DiagnosticReportModal } from './DiagnosticReportModal';
import { ChatMessage, ConsultationStage, SchoolData, Reservation } from '../types';

interface AIConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  serviceUnavailable: boolean;
  currentStage: ConsultationStage;
  selectedSchool?: SchoolData;
  selectedGrade?: string;
  selectedConcerns?: string[];
  reservation?: Reservation;
  onSendMessage: (text: string) => void;
  onSelectSchool: (school: SchoolData) => void;
  onSelectConcern: (concern: string) => void;
  onReset: () => void;
  onOpenReservationModal: () => void;
}

export const AIConsultationModal: React.FC<AIConsultationModalProps> = ({
  isOpen,
  onClose,
  messages,
  isLoading,
  serviceUnavailable,
  currentStage,
  selectedSchool,
  selectedGrade,
  selectedConcerns = [],
  reservation,
  onSendMessage,
  onSelectSchool,
  onSelectConcern,
  onReset,
  onOpenReservationModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const hasDiagnosticOutput = !serviceUnavailable && currentStage >= 3;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl border-2 border-[#122B49] max-w-3xl w-full h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#122B49] text-white p-3.5 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#C59750] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    빅뱅영어학원 AI 상담실장
                  </h3>
                  {selectedSchool && (
                    <span className="bg-[#C59750] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {selectedSchool.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300">
                  만수동 6개교 기출 데이터베이스 기반 1:1 맞춤 학습진단
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                title="상담 초기화"
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* 4-Step Consultation Progress Bar & Actions */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className={`w-2 h-2 rounded-full ${serviceUnavailable ? 'bg-amber-500' : hasDiagnosticOutput ? 'bg-emerald-600' : 'bg-blue-500'}`} />
              <span>{serviceUnavailable ? '자동 분석 연결 실패' : hasDiagnosticOutput ? '1:1 맞춤 진단 완료' : '상담 대기 중'}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Show a report only after a real diagnostic response. */}
              {hasDiagnosticOutput && <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs font-black text-[#122B49] bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border border-amber-300 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <FileText className="w-3.5 h-3.5 text-[#C59750]" />
                <span>맞춤 진단 리포트 PDF</span>
              </button>}

              <button
                type="button"
                onClick={onOpenReservationModal}
                className="text-xs font-bold text-[#122B49] bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">무료 레벨테스트 신청</span>
                <span className="sm:hidden">예약</span>
              </button>
            </div>
          </div>

          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#F8FAFC]">
            {messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                onSelectQuickReply={onSendMessage}
                onOpenReservationModal={onOpenReservationModal}
                onOpenDiagnosticReport={hasDiagnosticOutput ? () => setIsReportModalOpen(true) : undefined}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium bg-white border border-slate-200 w-fit px-4 py-2.5 rounded-2xl shadow-xs">
                <Sparkles className="w-4 h-4 text-blue-700 animate-spin shrink-0" />
                <span>AI 상담실장이 만수동 기출 데이터를 분석하여 답변을 작성하고 있습니다...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Toolbar */}
          <div className="p-2 sm:p-3 bg-white border-t border-slate-200">
            <QuickActionToolbar
              currentStage={currentStage}
              selectedSchool={selectedSchool}
              onSendPresetMessage={onSendMessage}
              onOpenReservationModal={onOpenReservationModal}
              onOpenDiagnosticReport={hasDiagnosticOutput ? () => setIsReportModalOpen(true) : undefined}
              onOpenSchoolGuide={() => {
                if (selectedSchool) {
                  onSendMessage(`${selectedSchool.name} 출제 분석과 기출 경향을 자세히 알려주세요.`);
                } else {
                  onSendMessage('만수동 주요 6개교 출제 경향과 분석 내용을 요약해 주세요.');
                }
              }}
            />

            {/* Chat Input Form */}
            <form onSubmit={handleSend} className="flex items-center gap-2 mt-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="예: 숭덕여고 1학년인데 서술형 영작 감점이 심해요, 레벨테스트 받고 싶어요"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#122B49] focus:bg-white rounded-xl text-xs sm:text-sm focus:outline-hidden transition text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="px-4 py-2.5 bg-[#122B49] hover:bg-[#1b3e69] disabled:opacity-40 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 text-[#C59750]" />
                <span>전송</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Diagnostic Report Summary PDF Modal */}
      <DiagnosticReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedSchool={selectedSchool}
        selectedGrade={selectedGrade}
        selectedConcerns={selectedConcerns}
        messages={messages}
        reservation={reservation}
        onOpenReservationModal={onOpenReservationModal}
      />
    </>
  );
};

