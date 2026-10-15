export type SchoolType = 'high' | 'middle' | 'elementary' | 'other';

export interface SchoolData {
  id: string;
  name: string;
  type: SchoolType;
  badge: string;
  targetFocus: string;
  textbookInfo: string;
  examRatio: string;
  gradeCutTrend: string;
  examFeatures: string[];
  killerPoints: string[];
  bigBangSolution: string[];
  quote: string;
}

export type ConsultationStage = 1 | 2 | 3 | 4;

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  stage?: ConsultationStage;
  suggestedQuickReplies?: string[];
  schoolData?: SchoolData;
  showReservationForm?: boolean;
}

export interface Reservation {
  id: string;
  studentName: string;
  parentPhone: string;
  school: string;
  grade: string;
  concerns: string[];
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  createdAt: string;
  status: '접수완료' | '상담대기' | '확정';
  kakaoNotified?: boolean;
  kakaoNotifyMessage?: string;
}
