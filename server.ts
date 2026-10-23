import express from "express";
import path from "path";
import { timingSafeEqual } from "node:crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory reservations database
interface ReservationRecord {
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

const reservations: ReservationRecord[] = [];

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System instructions for AI Consultation Director with verified school database
const SYSTEM_INSTRUCTION = `
당신은 인천 남동구 만수동 '빅뱅영어학원'의 [1차 상담 및 학습진단 전담 AI 상담실장]입니다.
학부모와 학생에게 매우 친절하고 신뢰감 넘치며 전문적인 어조('~합니다', '~해요', '어머님/학생분' 호칭 사용)로 상담을 진행합니다.

[주요 목적]
학생의 학교, 학년, 영어 고민을 세심하게 파악하고, 만수동 지역의 실제 학교별 출제 경향과 기출 데이터를 바탕으로 신뢰를 준 뒤 '학교별 맞춤 무료 레벨테스트 및 1:1 학습 컨설팅' 예약을 완료하도록 이끕니다.

[만수동 주요 학교별 공인 기출 데이터베이스 및 출제 경향]
1. 동인천고등학교:
   - 교재: 교과서(비상 홍민표 / 능률 김성곤) + 모의고사 2~3개년(16~20지문) + EBS 부교재
   - 배점: 선택형 65점(20문항) + 서술형 35점(5문항) / 수행평가 40%
   - 1등급 컷: 평균 93~95점선 (서술형 부분 감점이 등급 직결)
   - 출제 특징: 교과서 비중은 20~25% 내외이며 모의고사/부교재 변형 출제가 75% 이상. 어휘 유의어·반의어 변형으로 단순 암기 학생 감점 유도. 밑줄 없는 전체 문장에서 어법 오류 고치기 킬러 빈출.
   - 빅뱅 솔루션: 동인천고 5개년 기출 변형 족보 워크북 + 전 지문 7단계 입체 체화 + 킬러 어법 1:1 클리닉

2. 숭덕여자고등학교:
   - 교재: 교과서(능률 양현권 / YBM 박준언) + 고난도 부교재(수능만만 / 마더텅 / 올림포스) + 듣기평가 심화 연계
   - 배점: 선택형 65점(21문항) + 서술형 35점(6문항) / 수행평가 40%
   - 1등급 컷: 평균 94~96점선 (서술형 무감점 학생이 최상위권 독점)
   - 출제 특징: 서술형 35점 고배점, 5개 이상 복합 조건(어형 변화, 필수 어휘, 접속사/분사구문) 영작 출제. 부교재 지문 다의어/숙어 심화 변형. 채점 기준 극도로 엄격.
   - 빅뱅 솔루션: 숭덕여고 서술형 영작 공식 12패턴 드릴 + 부교재 3회독 압축 워크북 + 1:1 대면 첨삭 무감점 클리닉

3. 문일여자고등학교:
   - 교재: 교과서(천재 이재영 / 비상) + 학평 모의고사 기출 + 외부 심화 지문(시사/TED/수능 연계)
   - 배점: 선택형 65점(20문항) + 서술형 35점(5~6문항) / 수행평가 40%
   - 1등급 컷: 평균 92~95점선 (문법 근거 서술 문항이 등급 판가름)
   - 출제 특징: 지문 원문 변형률이 매우 높음. 틀린 어법을 찾아 올바르게 고치고 그 '문법적 근거(이유)'를 구체적으로 서술하는 고유 킬러 출제. 문장 성분(SVOC) 구조 분해 능력 필수.
   - 빅뱅 솔루션: 문일여고 기출 구문 분석서 기반 지문 변형 예측 500제 + SVOC 직독직해 훈련 + 어법 근거 서술 핀셋 특강

4. 만수고등학교:
   - 교재: 교과서(능률 김성곤 / 지학사) + 전국연합학력평가 기출 변형(18~22지문) + EBS 올림포스
   - 배점: 선택형 70점(22문항) + 서술형 30점(5문항) / 수행평가 40%
   - 1등급 컷: 평균 91~94점선 (요약문 서술형 완성도에 따라 갈림)
   - 출제 특징: 긴 독해 지문과 빠른 속독 속해 요구. 모의고사 대의 파악 및 요약문 빈칸 완성 배점 큼. 어휘 파생어/반의어 치환 빈출.
   - 빅뱅 솔루션: 만수고 기출 요약문 빈칸 완성 패턴 20선 + 모의고사 5단계 변형 족보 + 주간 타임어택 실전 모의고사

5. 인제고등학교:
   - 교재: 교과서(동아 권혁승 / 비상) + 전국연합학력평가 기출(20~24지문) + EBS 수능특강 라이트
   - 배점: 선택형 65점(20문항) + 서술형 35점(5문항) / 수행평가 40%
   - 1등급 컷: 평균 92~95점선 (고난도 어법 복수 선택 및 서술형 감점이 등급 결정)
   - 출제 특징: 수능 연계형 고난도 장문 독해와 빈칸 추론 다수. 밑줄 없는 어법 오류 수정 킬러 문항. 문장 구조 재배열 및 고급 유의어 치환.
   - 빅뱅 솔루션: 인제고 5개년 기출 변형 워크북 + 고난도 구문(도치/분사구문) 1:1 클리닉 + 실전 타임어택 모의고사

6. 신명여자고등학교:
   - 교재: 교과서(능률 김성곤 / 천재) + 고난도 부교재(수능만만 / 올림포스 독해의 기본) + 모의고사 변형
   - 배점: 선택형 65점(21문항) + 서술형 35점(5~6문항) / 수행평가 40%
   - 1등급 컷: 평균 93~96점선 (여고 특유의 치열한 내신 경쟁, 서술형 무감점이 필수)
   - 출제 특징: 치밀하고 꼼꼼한 출제, 부분 감점 기준 극도로 엄격. 필수 조건 어순 배열 및 어형 변화 영작 배점 높음. 부교재 지문 어휘 변형 심화.
   - 빅뱅 솔루션: 신명여고 서술형 조건 영작 10대 패턴 드릴북 + 부교재 다의어/유의어 암기 3회독 + 무감점 1:1 대면 첨삭

7. 만수북중학교:
   - 교재: 교과서(동아 윤정미 / 천재 정사열) + 학교 단원별 문법 학습지
   - 배점: 선택형 75점(22~24문항) + 서술형 25점(5~6문항) / 수행평가 40%
   - A등급 컷: 90점 이상 (서술형 조건 감점 1개로 B등급 추락 빈번)
   - 출제 특징: 단원 핵심 문법(관계대명사, to부정사, 현재완료 등) 서술형 고배점. Listen & Speak 대화문 변형 및 영영풀이 단골 출제.
   - 빅뱅 솔루션: 만수북중 단원별 5단계 영작 드릴북 + 대화문 100% 빈칸 대비집 + 영영풀이 총정리 족보

8. 만수중학교:
   - 교재: 교과서(미래엔 최연희 / 비상 김진완) + 단어/숙어 학교 프린트
   - 배점: 선택형 75점(22~25문항) + 서술형 25점(5문항) / 수행평가 40%
   - A등급 컷: 90점 이상 (모두 고르기 복수 정답 문항 정복 여부가 최상위권 결정)
   - 출제 특징: 본문 꼼꼼한 세부 독해. 어법상 옳은 것/틀린 것 '모두 고르기(다중 선택)' 킬러 문항 빈출. 지칭 추론 및 흐름 무관 문장 찾기.
   - 빅뱅 솔루션: 만수중 전용 단어·숙어 마스터 프로그램 + 본문 빈칸·해석·영작 3단계 암기 + 모두 고르기 소거법 특훈

9. 만수여중학교:
   - 교재: 교과서(천재 이재영 / 동아) + 학교 자체 심화 프린트물(어휘 영영풀이, 심화 문법 예문 30여 페이지)
   - 배점: 선택형 75~80점(23~26문항) + 서술형 20~25점(4~5문항) / 수행평가 40%
   - A등급 컷: 90점 이상 (학교 프린트물 100% 완벽 암기 학생이 95점 이상 최상위권)
   - 출제 특징: 학교 프린트물(학습지) 연계율 40~50% 이상. 어법상 어색한 문장의 개수(1개~4개) 고르기 킬러 문항. 선택지가 영어로 출제됨.
   - 빅뱅 솔루션: 만수여중 프린트물 전 지문 수거 워크북 + 어법 개수 찾기 실전 모의고사 10회분 + 영어 보기 직독직해 훈련

10. 간석여자중학교:
   - 교재: 교과서(미래엔 최연희 / 비상) + 학교 자체 단원별 문법·어휘 학습지
   - 배점: 선택형 75~80점(22~25문항) + 서술형 20~25점(4~5문항) / 수행평가 40%
   - A등급 컷: 90점 이상 (학습지 연계 문항과 서술형 조건 영작이 결정)
   - 출제 특징: 학교 배부 문법·어휘 학습지 시험 연계율 40% 이상. 본문 세부 내용 일치/불일치 및 글의 순서 배열. 대화문 변형 빈출.
   - 빅뱅 솔루션: 간석여중 학습지 100% 적중 워크북 + 단원별 핵심 문법 3단계 드릴 + 직전 파이널 실전 모의고사 5회분

11. 정각중학교:
   - 교재: 교과서(천재 이재영 / 동아) + 학교 단원별 심화 학습지 + 추가 읽기 자료(More Reading)
   - 배점: 선택형 75점(22~24문항) + 서술형 25점(5~6문항) / 수행평가 40%
   - A등급 컷: 90점 이상 (복합 조건 서술형 영작 및 어법 다중 선택형에서 등급 갈림)
   - 출제 특징: 구월·만수 지역 중학교 중 내신 영어 변별력 최상위. 어법 옳은/틀린 것 모두 고르기 출제. 추가 읽기 지문과 영영풀이 연계 심화.
   - 빅뱅 솔루션: 정각중 기출 유형 완벽 분석 워크북 + 단원별 서술형 10대 패턴 드릴 + 추가 읽기 자료 100% 변형 대비

12. 기타 인근 학교 및 초등부 (신송고, 구월중, 담방초, 만수초, 인수초 등):
   - 특징: 인근 고교의 수능형 장문 독해와 고난도 어법 대비, 초등 고학년을 위한 파닉스 완성 후 초등 필수 1200단어 마스터 및 중등 기초 문법(품사, 문장성분, 시제) 완성 로드맵 제공.

[학원 기본 정보 및 연락처]
- 학원명: 빅뱅영어학원
- 대표 상담 전화: 032-471-7525 (방문 상담 및 유선 문의)
- 카카오톡 1:1 오픈채팅: https://open.kakao.com/o/sgKXFMMi
- 위치: 인천광역시 남동구 만수서로 62 제이제이스타프라자 3층 301-305호 (포레시안APT 정문 앞 / 동인천고, 숭덕여중고 인근)
- 운영 시간: 평일 14:00 ~ 23:00 / 주말 10:00 ~ 19:00 (내신 대비 집중 클리닉)

[빅뱅영어학원의 3대 핵심 강점]
1. 만수동 주요 학교 기출 문제 완벽 분석 및 서술형/부교재 밀착 대비
2. 초등 기초부터 중고등 내신 1등급 & 수능 완성 로드맵 제공
3. 객관적 지표 기반 정밀 무료 레벨테스트 및 1:1 밀착 클리닉 관리

[상담 4단계 가이드라인]
1단계 [인사 및 기본 정보 수집]: 학생의 학년과 재학 중인 학교를 확인합니다.
2단계 [학습 고민 파악]: 내신 서술형 감점, 어휘력, 문법 기초, 독해 시간 부족, 부교재 변형 등 학생의 가장 큰 답답함을 경청하고 공감합니다.
3단계 [학교별 정확한 기출 데이터 기반 솔루션 제시]: 위 학교별 데이터베이스(교재, 출제비율, 킬러 문항, 1등급 컷)를 토대로 학생의 취약점을 정확히 짚고, 빅뱅영어학원의 맞춤 워크북과 1:1 첨삭 클리닉을 안내합니다.
4단계 [무료 레벨테스트 예약 유도]: 60분 소요되는 '무료 정밀 레벨테스트(어휘·문법·독해·구문 진단 + 원장 직강 성적표 분석)'를 권유하며, 예약 일정을 확정하도록 돕습니다.

[응답 규칙]
- 한국어로 정중하고 공감 어린 태도로 답변하세요.
- 학교 언급 시 위 [만수동 주요 학교별 공인 기출 데이터베이스]의 정확한 사실(교재, 킬러 유형, 배점 등)을 근거로 구체적이고 전문적인 통찰을 제시하세요.
- 답변은 가독성 좋게 줄바꿈과 요약 포인트를 사용하여 깔끔하게 전달하세요.
- 각 답변 끝에는 학생/학부모가 다음 단계로 편안하게 대답할 수 있도록 자연스러운 유도 질문이나 안내를 덧붙이세요.
`;

// Helper for realistic AI fallback if Gemini API key is missing
function generateSmartConsultationFallback(
  userText: string,
  school?: string,
  grade?: string,
  concern?: string,
  stage?: number
): { text: string; nextStage: number; suggestedReplies: string[]; schoolId?: string } {
  const lower = userText.toLowerCase();

  // Detect school mention
  let matchedSchool = school || '';
  if (lower.includes('동인천') || lower.includes('동인천고')) matchedSchool = '동인천고등학교';
  else if (lower.includes('숭덕') || lower.includes('숭덕여고')) matchedSchool = '숭덕여고';
  else if (lower.includes('문일') || lower.includes('문일여고')) matchedSchool = '문일여고';
  else if (lower.includes('만수고') || lower.includes('만수고등학교')) matchedSchool = '만수고등학교';
  else if (lower.includes('인제') || lower.includes('인제고')) matchedSchool = '인제고등학교';
  else if (lower.includes('신명') || lower.includes('신명여고')) matchedSchool = '신명여자고등학교';
  else if (lower.includes('만수북') || lower.includes('만수북중')) matchedSchool = '만수북중학교';
  else if (lower.includes('만수여중')) matchedSchool = '만수여중학교';
  else if (lower.includes('만수중')) matchedSchool = '만수중학교';
  else if (lower.includes('간석여중') || lower.includes('간석여자중')) matchedSchool = '간석여자중학교';
  else if (lower.includes('정각') || lower.includes('정각중')) matchedSchool = '정각중학교';
  else if (lower.includes('초등') || lower.includes('담방초') || lower.includes('만수초') || lower.includes('인수초')) matchedSchool = '초등부(만수동 인근 초등학교)';

  // Detect 2027 예비고1 mention
  if (lower.includes('예비고1') || lower.includes('2027')) {
    return {
      text: `🎯 **2027 예비고1(현 중3) 고등영어 정밀 진단 안내**입니다!\n\n중등 내신에서는 교과서 본문 암기로 90점대(A등급)를 받던 학생들도, 고등학교 첫 중간고사에서 4~5등급으로 급락하는 경우가 매우 많습니다.\n\n고등학교 시험은 교과서 비중이 20% 내외이고 **모의고사/EBS 부교재 변형이 80% 이상**이며, 밑줄 없는 통문장 어법 수정과 조건 영작 등 **고난도 서술형 감점**이 1등급을 가르기 때문입니다.\n\n빅뱅영어학원에서는 **동인천고·숭덕여고·문일여고·만수고·인제고·신명여고** 등 지망 고교별 5개년 기출 DB를 바탕으로 **60분 무료 정밀 진단평가(어휘·문법·독해·구문)** 및 **원장 1:1 맞춤 로드맵 리포트 상담**을 제공합니다.\n\n지망하시는 고등학교나 희망하시는 방문 상담 일정을 남겨주시면 바로 안내해 드리겠습니다! 😊`,
      nextStage: 3,
      suggestedReplies: [
        '동인천고 진학 예정입니다',
        '숭덕여고 지망하고 있어요',
        '문일여고 진학 생각 중이에요',
        '만수고 지망 예정입니다',
        '2027 예비고1 무료 진단예약 신청'
      ]
    };
  }

  // Detect stage or flow
  if (!matchedSchool && (!stage || stage === 1)) {
    return {
      text: `안녕하세요! 인천 남동구 만수동 **빅뱅영어학원** 1차 상담 및 학습진단 전담 AI 상담실장입니다. 😊\n\n만수동 지역 학생들의 내신 1등급과 튼튼한 영어 실력 완성을 위해 학교별 최신 기출 데이터를 기반으로 1:1 맞춤 진단을 도와드리고 있습니다.\n\n먼저 학생의 **재학 중인 학교와 현재 학년**을 알려주시겠어요? 만수동 및 인근 주요 학교(동인천고, 숭덕여고, 문일여고, 만수고, 인제고, 신명여고, 만수북중, 만수중, 만수여중, 간석여중, 정각중)는 학교별 출제 경향과 부교재 비중이 크게 달라 학교 맞춤 전략이 필수적입니다!`,
      nextStage: 1,
      suggestedReplies: [
        '동인천고 1학년입니다',
        '숭덕여고 2학년이에요',
        '문일여고 1학년입니다',
        '만수고 1학년입니다',
        '인제고 1학년입니다',
        '신명여고 2학년이에요',
        '간석여중 2학년입니다',
        '정각중 2학년입니다'
      ]
    };
  }

  // If school is known and stage is about concern
  if (matchedSchool && (!concern || stage === 2 || lower.includes('학년') || lower.includes('학교'))) {
    return {
      text: `**${matchedSchool}** 학생이시군요! 정확한 데이터로 안내해 드리겠습니다.\n\n${matchedSchool}는 만수동에서도 학교 시험만의 고유한 킬러 출제 패턴(부교재 변형, 서술형 조건 감점, 어법 킬러 등)이 뚜렷하여 체계적인 분석 없이는 점수 향상이 어려운 곳입니다.\n\n현재 학생이 영어 공부를 하면서 **가장 답답하거나 점수를 깎아먹는 핵심 고민**은 무엇인가요?\n(예: 내신 서술형 조건 감점, 어휘력 부족, 문법 개념 부실, 독해 시간 부족, 모의고사/부교재 변형 문제 취약 등)`,
      nextStage: 2,
      suggestedReplies: [
        '내신 서술형 조건 영작 감점이 심해요',
        '단어 암기가 약하고 어휘력이 부족해요',
        '문법 개념이 헷갈려 문제 적용이 안 돼요',
        '독해 속도가 느려 시험 시간이 부족해요',
        '교과서는 외우겠는데 모의고사/부교재가 어려워요'
      ]
    };
  }

  // Stage 3: Specific school solution based on accurate school data
  if (stage === 3 || concern || lower.includes('서술형') || lower.includes('문법') || lower.includes('단어') || lower.includes('어휘') || lower.includes('모의고사') || lower.includes('독해')) {
    let schoolSpecificInsight = '';
    if (matchedSchool.includes('동인천')) {
      schoolSpecificInsight = `💡 **동인천고등학교 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(비상 홍민표 / 능률) 20% + 모의고사 2~3개년(16~20지문) 80% + EBS 부교재
• **배점 구조**: 선택형 65점(20문항) + 서술형 35점(5문항)
• **1등급 컷**: 평균 93~95점선 (서술형 부분 감점이 1~2등급 결정)
• **핵심 킬러**: 밑줄 없이 전체 문단에서 틀린 어법 찾기, 지문 내 핵심 어휘의 유의어/반의어 치환, 요약문 조건 영작
• **빅뱅 맞춤 솔루션**: 동인천고 5개년 기출 변형 족보 워크북 + 전 지문 7단계(어법/빈칸/순서/삽입/영작) 체화 + 매주 킬러 어법 1:1 대면 첨삭 클리닉`;
    } else if (matchedSchool.includes('숭덕')) {
      schoolSpecificInsight = `💡 **숭덕여자고등학교 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(능률 / YBM) + 고난도 부교재(수능만만 / 마더텅 / 올림포스) + 듣기평가 심화 연계
• **배점 구조**: 선택형 65점(21문항) + 서술형 35점(6문항)
• **1등급 컷**: 평균 94~96점선 (서술형 무감점 학생이 최상위권 독점)
• **핵심 킬러**: 5개 이상 복합 조건(단어 어형 변화, 어순 배열, 분사구문/접속사) 영작, 부교재 다의어/숙어 변형
• **빅뱅 맞춤 솔루션**: 숭덕여고 전용 서술형 12패턴 드릴 + 부교재 3회독 압축 워크북 + 1:1 서술형 무감점 첨삭 클리닉`;
    } else if (matchedSchool.includes('문일')) {
      schoolSpecificInsight = `💡 **문일여자고등학교 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(천재 이재영 / 비상) + 학평 모의고사 기출 + 외부 심화 지문(시사/TED/수능 연계)
• **배점 구조**: 선택형 65점(20문항) + 서술형 35점(5~6문항)
• **1등급 컷**: 평균 92~95점선 (문법 근거 서술 문항이 등급 판가름)
• **핵심 킬러**: 틀린 어법을 찾아 바르게 고치고 그 '문법적 근거(이유)'를 우리말로 서술하는 고유 킬러, 외부 연계 지문
• **빅뱅 맞춤 솔루션**: 문일여고 기출 구문 분석서 기반 변형 예측 500제 + SVOC 직독직해 구문 체급 형성 + 어법 근거 서술 특강`;
    } else if (matchedSchool.includes('만수고')) {
      schoolSpecificInsight = `💡 **만수고등학교 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(능률 김성곤 / 지학사) + 전국연합학력평가 기출 변형(18~22지문) + EBS 올림포스
• **배점 구조**: 선택형 70점(22문항) + 서술형 30점(5문항)
• **1등급 컷**: 평균 91~94점선 (요약문 서술형 완성도에 따라 갈림)
• **핵심 킬러**: 요약문 빈칸 품사 변형 영작, 지시어/연결어 삭제 순서 배열, 후반부 장문 독해 시간 안배
• **빅뱅 맞춤 솔루션**: 만수고 기출 요약문 빈칸 완성 20선 + 모의고사 전 지문 5단계 변형 족보 + 주간 타임어택 실전 모의고사`;
    } else if (matchedSchool.includes('인제')) {
      schoolSpecificInsight = `💡 **인제고등학교 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(동아 권혁승 / 비상) + 학평 기출(20~24지문) + EBS 수능특강 라이트
• **배점 구조**: 선택형 65점(20문항) + 서술형 35점(5문항)
• **1등급 컷**: 평균 92~95점선 (고난도 어법 복수 선택 및 서술형 감점이 등급 결정)
• **핵심 킬러**: 지문 변형 후 밑줄 없는 어법 오류 수정 문항, 수능 킬러 빈칸 추론의 요약문 조건 영작
• **빅뱅 맞춤 솔루션**: 인제고 5개년 기출 변형 족보 워크북 + 고난도 구문(도치/분사구문) 1:1 클리닉 + 실전 타임어택 모의고사`;
    } else if (matchedSchool.includes('신명')) {
      schoolSpecificInsight = `💡 **신명여자고등학교 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(능률 김성곤 / 천재) + 고난도 부교재(수능만만 / 올림포스 독해의 기본) + 모의고사 변형
• **배점 구조**: 선택형 65점(21문항) + 서술형 35점(5~6문항)
• **1등급 컷**: 평균 93~96점선 (여고 특유의 치열한 내신 경쟁, 서술형 무감점이 필수)
• **핵심 킬러**: 필수 제시 단어 어순 배열 및 어형 변화 서술형 영작, 부교재 다의어/유의어 변형 출제
• **빅뱅 맞춤 솔루션**: 신명여고 서술형 조건 영작 10대 패턴 드릴북 + 부교재 다의어/유의어 총정리 암기 3회독 + 1:1 대면 첨삭`;
    } else if (matchedSchool.includes('만수북')) {
      schoolSpecificInsight = `💡 **만수북중학교 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(동아 윤정미 / 천재 정사열) + 학교 단원별 문법 학습지
• **배점 구조**: 선택형 75점(22~24문항) + 서술형 25점(5~6문항)
• **A등급 컷**: 90점 이상 (서술형 조건 감점 1개로 B등급 추락 빈번)
• **핵심 킬러**: 단원 핵심 문법(to부정사, 관계사, 현재완료 등) 서술형 영작(구두점/대소문자/수일치 감점), Listen & Speak 대화문 변형, 영영풀이
• **빅뱅 맞춤 솔루션**: 만수북중 단원별 5단계 영작 드릴북 + 대화문 100% 빈칸 대비집 + 영영풀이 총정리 족보`;
    } else if (matchedSchool.includes('간석여중')) {
      schoolSpecificInsight = `💡 **간석여자중학교 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(미래엔 최연희 / 비상) + 학교 자체 단원별 문법·어휘 학습지
• **배점 구조**: 선택형 75~80점(22~25문항) + 서술형 20~25점(4~5문항)
• **A등급 컷**: 90점 이상 (학교 학습지 연계 문항과 서술형 조건 영작이 결정)
• **핵심 킬러**: 학교 학습지 예문 변형 서술형 영작의 수일치/시제 실수, 대화문 속 세부 어구 바꿔치기 함정
• **빅뱅 맞춤 솔루션**: 간석여중 학습지 전 문항 수거 워크북 + 단원별 핵심 문법 3단계 드릴 + 파이널 실전 모의고사 5회분`;
    } else if (matchedSchool.includes('정각')) {
      schoolSpecificInsight = `💡 **정각중학교 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(천재 이재영 / 동아) + 학교 단원별 심화 학습지 + 추가 읽기 자료(More Reading)
• **배점 구조**: 선택형 75점(22~24문항) + 서술형 25점(5~6문항)
• **A등급 컷**: 90점 이상 (복합 조건 서술형 영작 및 어법 다중 선택형에서 등급 갈림)
• **핵심 킬러**: 어법상 옳은/틀린 것 모두 고르기(복수 정답) 문항, 서술형 조건 영작 어형 변화 실패
• **빅뱅 맞춤 솔루션**: 정각중 기출 유형 완벽 분석 워크북 + 서술형 10대 패턴 드릴 + 추가 읽기 자료 100% 변형 대비`;
    } else if (matchedSchool.includes('만수여중')) {
      schoolSpecificInsight = `💡 **만수여중학교 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(천재 이재영 / 동아) + 학교 자체 심화 프린트물(어휘 영영풀이, 심화 문법 예문 30여 페이지)
• **배점 구조**: 선택형 75~80점(23~26문항) + 서술형 20~25점(4~5문항)
• **A등급 컷**: 90점 이상 (학교 프린트물 100% 암기 학생이 95점 이상 전교 최상위권)
• **핵심 킬러**: 학교 프린트물 심화 예문 변형, '어법상 어색한 문장의 개수는?' 개수형 킬러, 영어 선택지
• **빅뱅 맞춤 솔루션**: 만수여중 프린트물 전 지문 수거 워크북 10회독 + 어법 개수 찾기 모의고사 10회분 + 영어 보기 직독직해 훈련`;
    } else if (matchedSchool.includes('만수중')) {
      schoolSpecificInsight = `💡 **만수중학교 기출 데이터 정밀 분석**:
• **교재 구성**: 교과서(미래엔 최연희 / 비상 김진완) + 단어/숙어 학교 프린트
• **배점 구조**: 선택형 75점(22~25문항) + 서술형 25점(5문항)
• **A등급 컷**: 90점 이상 (모두 고르기 복수 정답 문항 정복 여부가 최상위권 결정)
• **핵심 킬러**: 어법상 옳은/틀린 것 '모두 고르기' 복합 다중 선택형 킬러, 지칭 추론 및 흐름 무관 문장
• **빅뱅 맞춤 솔루션**: 만수중 전용 단어·숙어 마스터 프로그램 + 본문 문장 단위 빈칸·해석·영작 3단계 암기 + 모두 고르기 소거법 특훈`;
    } else {
      schoolSpecificInsight = `💡 **빅뱅영어학원 맞춤 클리닉 솔루션**:
• **학교별 맞춤**: 만수동 및 남동구 주요 학교(인제고, 신송고, 담방초, 만수초 등) 기출 DB 및 교과서·부교재 분석 완료
• **초등 기초 & 중등 선행**: 파닉스 완성 후 초등 필수 1200단어 마스터 및 중1 핵심 문법(품사, 문장성분, 시제) 완성
• **고등부 내신 & 수능**: 내신 1등급 관리와 모의고사 1등급 동시 완성 로드맵 제공`;
    }

    return {
      text: `${schoolSpecificInsight}\n\n말씀해주신 고민은 학생의 성실함 문제가 아니라, **학교별 실제 출제 코드에 맞춘 정확한 공략법과 취약점 진단**이 선행되지 않았기 때문입니다.\n\n이 문제를 데이터에 기반해 확실하게 해결하기 위해, 먼저 학원에 방문하셔서 **[무료 1:1 정밀 레벨테스트 및 학습 컨설팅(약 60분)]**을 받아보시는 것을 강력히 추천드립니다.\n\n- **소요 시간**: 약 60분 (어휘·문법·독해·구문 4영역 정밀 진단 + 원장 직강 성적표 분석)\n- **비용**: 전액 무료 (상담 후 등록 강요 없음)\n- **장소**: 인천 남동구 만수동 빅뱅영어학원 (만수역 / 만수주공 / 포레시안 인근)\n\n평일 저녁이나 주말 중 편하신 방문 시간대가 있으신가요? 바로 무료 우선 예약을 도와드릴 수 있습니다. 📝`,
      nextStage: 4,
      suggestedReplies: [
        '무료 레벨테스트 예약할게요!',
        '평일 오후 5시 이후 가능한가요?',
        '주말 토요일 상담도 되나요?',
        '레벨테스트는 어떤 방식으로 진행되나요?'
      ]
    };
  }

  // Default Stage 4: Booking assistance
  return {
    text: `네, 맞춤 레벨테스트를 통해 학생의 진짜 영어 강점과 약점을 데이터로 정확히 짚어드리겠습니다!\n\n학부모님 또는 학생분의 **성함, 연락처, 그리고 희망하시는 방문 날짜/시간**을 남겨주시면 상담실장이 확인 즉시 우선 예약 확정 문자를 발송해 드립니다.\n\n(하단의 간편 예약 카드를 이용하시면 30초 만에 접수가 완료됩니다!) ✨`,
    nextStage: 4,
    suggestedReplies: [
      '간편 예약 양식 작성하기',
      '학원 위치가 어디인가요?',
      '상담실장님과 전화 통화 가능한가요?'
    ]
  };
}

// Helper for robust Gemini call with multi-model fallback and exponential backoff
async function generateConsultationWithGemini(
  ai: GoogleGenAI,
  prompt: string
): Promise<string | null> {
  const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            topP: 0.9,
          },
        });

        const reply = response.text?.trim();
        if (reply) {
          return reply;
        }
      } catch (err: any) {
        const msg = String(err?.message || "");
        const status = err?.status || err?.code;
        const isTransient =
          status === 503 ||
          status === 429 ||
          msg.includes("503") ||
          msg.includes("429") ||
          msg.includes("high demand") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("RESOURCE_EXHAUSTED");

        if (isTransient && attempt === 0) {
          // Brief pause before retry on high demand
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }
        // Switch to the next candidate model
        break;
      }
    }
  }

  return null;
}

// API Routes
app.post("/api/chat", async (req, res) => {
  try {
    const { message, messagesHistory = [], school, grade, concern, stage = 1 } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Message is required" });
    }

    // Detect target school from message or state
    let identifiedSchool = school || '';
    const lower = message.toLowerCase();
    if (lower.includes('동인천') || lower.includes('동인천고')) identifiedSchool = '동인천고등학교';
    else if (lower.includes('숭덕') || lower.includes('숭덕여고')) identifiedSchool = '숭덕여고';
    else if (lower.includes('문일') || lower.includes('문일여고')) identifiedSchool = '문일여고';
    else if (lower.includes('만수고') || lower.includes('만수고등학교')) identifiedSchool = '만수고등학교';
    else if (lower.includes('인제') || lower.includes('인제고')) identifiedSchool = '인제고등학교';
    else if (lower.includes('신명') || lower.includes('신명여고')) identifiedSchool = '신명여자고등학교';
    else if (lower.includes('만수북') || lower.includes('만수북중')) identifiedSchool = '만수북중학교';
    else if (lower.includes('만수여중')) identifiedSchool = '만수여중학교';
    else if (lower.includes('만수중')) identifiedSchool = '만수중학교';
    else if (lower.includes('간석여중') || lower.includes('간석여자중')) identifiedSchool = '간석여자중학교';
    else if (lower.includes('정각') || lower.includes('정각중')) identifiedSchool = '정각중학교';

    const ai = getAIClient();

    if (ai) {
      try {
        // Prepare context prompt
        const conversationContext = messagesHistory
          .slice(-6)
          .map((m: any) => `${m.sender === 'user' ? '학생/학부모' : 'AI 상담실장'}: ${m.text}`)
          .join("\n");

        const prompt = `
[현재 상담 진행 상태]
- 확인된 학교: ${identifiedSchool || '미입력 (질문 필요)'}
- 확인된 학년: ${grade || '미입력'}
- 파악된 학습 고민: ${concern || '미입력'}
- 현재 상담 단계: ${stage}단계

[핵심 지침: 정확한 학교별 데이터 반영]
상담 시 반드시 시스템 프롬프트의 [만수동 주요 학교별 공인 기출 데이터베이스]에 수록된 정확한 교재 정보(교과서 출판사, 부교재), 배점 비율(선택형/서술형), 1등급/A등급 컷, 킬러 문항 유형을 인용하여 학부모/학생에게 고도의 신뢰감을 주는 전문적인 진단을 제공하세요.

[이전 대화 맥락]
${conversationContext || '첫 대화 시작'}

[사용자 최신 입력]
학생/학부모: ${message}

위 사용자 입력에 대해 인천 만수동 '빅뱅영어학원' AI 상담실장으로서 친절하고 전문적으로 답변해주세요.
반드시 대화 흐름(1단계 정보수집 -> 2단계 고민파악 -> 3단계 학교별 정확한 기출 데이터 기반 솔루션 -> 4단계 무료 레벨테스트 예약 유도)을 따르고, 상대방의 학교와 고민에 공감하며, 방문 무료 레벨테스트 예약으로 자연스럽게 안내하세요.
`;

        const replyText = await generateConsultationWithGemini(ai, prompt);

        if (replyText) {
          // Determine stage and replies
          let nextStage = stage;
          if (stage === 1 && (identifiedSchool || message.includes('고') || message.includes('중'))) nextStage = 2;
          else if (stage === 2 && (concern || message.includes('서술형') || message.includes('문법') || message.includes('단어') || message.includes('독해'))) nextStage = 3;
          else if (stage >= 3) nextStage = 4;

          const suggestedReplies = nextStage === 4 
            ? ['무료 레벨테스트 예약하기', '평일 저녁 6시 희망', '주말 토요일 희망']
            : nextStage === 3 
            ? ['무료 레벨테스트 자세히 보기', '학원 수업 방식이 궁금해요']
            : nextStage === 2 
            ? ['서술형 영작이 너무 불안해요', '단어와 문법 기초가 부족해요', '독해 시간이 부족해요']
            : ['동인천고 1학년', '숭덕여고 2학년', '문일여고 1학년', '만수고 1학년', '만수북중 2학년'];

          return res.json({
            text: replyText,
            stage: nextStage,
            suggestedReplies
          });
        }
      } catch {
        // Fall back gracefully to the offline consultation engine
      }
    }

    // Fallback if no API key or call failed
    const fallback = generateSmartConsultationFallback(message, identifiedSchool || school, grade, concern, stage);
    return res.json({
      text: fallback.text,
      stage: fallback.nextStage,
      suggestedReplies: fallback.suggestedReplies
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "상담 응답 생성 중 오류가 발생했습니다." });
  }
});

// Admin access is disabled until a private, strong ADMIN_PIN is configured on the server.
const ADMIN_PIN = process.env.ADMIN_PIN?.trim();

export function isValidAdminPin(inputPin: any): boolean {
  if (!ADMIN_PIN || ADMIN_PIN.length < 12 || typeof inputPin !== 'string') return false;
  const candidate = inputPin.trim();
  const supplied = Buffer.from(candidate);
  const expected = Buffer.from(ADMIN_PIN);
  if (supplied.length !== expected.length) return false;
  return timingSafeEqual(supplied, expected);
}

// Mutable Academy notification & Open Chat settings
interface AcademySettings {
  kakaoOpenChatUrl: string;
  autoOpenChatOnSubmit: boolean;
  notifyWebhookUrl?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  kakaoJsKey?: string;
  adminPhone: string;
  directorMobile?: string;
  directorName: string;
  prep2027CampaignEnabled: boolean;
  prep2027ExpiryDate: string;
}

const academySettings: AcademySettings = {
  kakaoOpenChatUrl: process.env.KAKAO_CHANNEL_CHAT_URL || 'https://open.kakao.com/o/sgKXFMMi',
  autoOpenChatOnSubmit: false,
  notifyWebhookUrl: process.env.KAKAO_DIRECTOR_NOTIFY_WEBHOOK || process.env.NOTIFICATION_WEBHOOK_URL || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  kakaoJsKey: process.env.KAKAO_JS_KEY || '',
  adminPhone: '032-471-7525',
  directorMobile: process.env.DIRECTOR_MOBILE || '010-2006-7525',
  directorName: '빅뱅영어학원 원장',
  prep2027CampaignEnabled: true,
  prep2027ExpiryDate: '2027-04-30T23:59:59',
};

// Dispatch real-time notification directly to director's phone (Telegram / Webhook / Console)
async function dispatchDirectorNotification(messageText: string, details?: any) {
  let dispatched = false;

  // 1. Telegram Push Notification (Direct push notification to smartphone with sound)
  if (academySettings.telegramBotToken && academySettings.telegramChatId) {
    try {
      const telegramUrl = `https://api.telegram.org/bot${academySettings.telegramBotToken}/sendMessage`;
      const res = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: academySettings.telegramChatId,
          text: messageText,
        }),
      });
      if (res.ok) {
        dispatched = true;
      }
    } catch (telegramErr) {
      console.warn("Telegram notification error:", telegramErr);
    }
  }

  // 2. Webhook Notification (Discord / Slack / Alimtalk webhook)
  const webhookUrl = academySettings.notifyWebhookUrl || process.env.KAKAO_DIRECTOR_NOTIFY_WEBHOOK;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messageText,
          content: messageText, // for Discord
          ...details,
        }),
      });
      if (res.ok) {
        dispatched = true;
      }
    } catch (webhookErr) {
      console.warn("Webhook notify error:", webhookErr);
    }
  }

  // Always log to server console for dev / audit
  console.log(`[원장님 스마트폰 실시간 자동 알림 전송]\n${messageText}`);
  return dispatched;
}

// Public settings endpoint for client UI
app.get("/api/settings", (_req, res) => {
  const isPrep2027Active =
    academySettings.prep2027CampaignEnabled &&
    new Date().getTime() <= new Date(academySettings.prep2027ExpiryDate).getTime();

  res.json({
    kakaoOpenChatUrl: academySettings.kakaoOpenChatUrl,
    autoOpenChatOnSubmit: academySettings.autoOpenChatOnSubmit,
    adminPhone: academySettings.adminPhone,
    directorMobile: academySettings.directorMobile,
    directorName: academySettings.directorName,
    kakaoJsKey: academySettings.kakaoJsKey,
    prep2027CampaignEnabled: academySettings.prep2027CampaignEnabled,
    prep2027ExpiryDate: academySettings.prep2027ExpiryDate,
    isPrep2027Active,
    telegramConfigured: Boolean(academySettings.telegramBotToken && academySettings.telegramChatId),
    webhookConfigured: Boolean(academySettings.notifyWebhookUrl),
  });
});

// Admin settings get endpoint
app.get("/api/admin/settings", (req, res) => {
  const pin = (req.headers['x-admin-pin'] as string) || (req.query.pin as string);
  if (!isValidAdminPin(pin)) {
    return res.status(401).json({ error: "관리자 권한이 필요합니다." });
  }
  const isPrep2027Active =
    academySettings.prep2027CampaignEnabled &&
    new Date().getTime() <= new Date(academySettings.prep2027ExpiryDate).getTime();

  res.json({
    ...academySettings,
    isPrep2027Active,
  });
});

// Admin settings update endpoint
app.patch("/api/admin/settings", (req, res) => {
  const pin = (req.headers['x-admin-pin'] as string) || (req.body.pin as string);
  if (!isValidAdminPin(pin)) {
    return res.status(401).json({ error: "관리자 권한이 필요합니다." });
  }
  const { 
    kakaoOpenChatUrl, 
    autoOpenChatOnSubmit, 
    notifyWebhookUrl, 
    telegramBotToken, 
    telegramChatId, 
    kakaoJsKey, 
    directorMobile,
    prep2027CampaignEnabled,
    prep2027ExpiryDate,
  } = req.body;

  if (typeof kakaoOpenChatUrl === 'string' && kakaoOpenChatUrl.trim()) {
    academySettings.kakaoOpenChatUrl = kakaoOpenChatUrl.trim();
  }
  if (typeof autoOpenChatOnSubmit === 'boolean') {
    academySettings.autoOpenChatOnSubmit = autoOpenChatOnSubmit;
  }
  if (typeof notifyWebhookUrl === 'string') {
    academySettings.notifyWebhookUrl = notifyWebhookUrl.trim();
  }
  if (typeof telegramBotToken === 'string') {
    academySettings.telegramBotToken = telegramBotToken.trim();
  }
  if (typeof telegramChatId === 'string') {
    academySettings.telegramChatId = telegramChatId.trim();
  }
  if (typeof kakaoJsKey === 'string') {
    academySettings.kakaoJsKey = kakaoJsKey.trim();
  }
  if (typeof directorMobile === 'string' && directorMobile.trim()) {
    academySettings.directorMobile = directorMobile.trim();
  }
  if (typeof prep2027CampaignEnabled === 'boolean') {
    academySettings.prep2027CampaignEnabled = prep2027CampaignEnabled;
  }
  if (typeof prep2027ExpiryDate === 'string' && prep2027ExpiryDate.trim()) {
    academySettings.prep2027ExpiryDate = prep2027ExpiryDate.trim();
  }
  const isPrep2027Active =
    academySettings.prep2027CampaignEnabled &&
    new Date().getTime() <= new Date(academySettings.prep2027ExpiryDate).getTime();

  res.json({ success: true, settings: { ...academySettings, isPrep2027Active } });
});

// Test Notification Endpoint for Admin Drawer
app.post("/api/admin/test-notify", async (req, res) => {
  const pin = (req.headers['x-admin-pin'] as string) || (req.body.pin as string);
  if (!isValidAdminPin(pin)) {
    return res.status(401).json({ error: "관리자 권한이 필요합니다." });
  }

  const testMessage = `[빅뱅영어학원 실시간 자동 알림 테스트]\n` +
    `• 테스트 시각: ${new Date().toLocaleTimeString('ko-KR')}\n` +
    `• 상태: 실시간 알림 연동이 성공적으로 활성화되었습니다!\n` +
    `*학부모가 상담을 신청하면 학부모의 수동 조작 없이 즉시 원장님 스마트폰으로 푸시 알림이 발송됩니다.`;

  const dispatched = await dispatchDirectorNotification(testMessage);
  return res.json({
    success: true,
    sentToExternal: dispatched,
    telegramConfigured: Boolean(academySettings.telegramBotToken && academySettings.telegramChatId),
    webhookConfigured: Boolean(academySettings.notifyWebhookUrl),
    message: dispatched 
      ? "원장님 스마트폰으로 테스트 알림이 성공적으로 전송되었습니다!" 
      : "알림 테스트가 완료되었습니다. (텔레그램 또는 웹훅 설정 시 스마트폰으로 직접 푸시 수신)"
  });
});

// Reservations endpoints
// Public users only receive { count: N, authorized: false }. Full data requires admin PIN.
app.get("/api/reservations", (req, res) => {
  const pin = (req.headers['x-admin-pin'] as string) || (req.query.pin as string);
  const isAuthenticated = isValidAdminPin(pin);

  if (isAuthenticated) {
    return res.json({
      count: reservations.length,
      authorized: true,
      reservations,
    });
  }

  // Unauthorized: Return only the total count. Personal information is strictly protected.
  return res.json({
    count: reservations.length,
    authorized: false,
    message: "개인정보 보호를 위해 상세 내역은 원장 및 관리자 인증 후 열람 가능합니다."
  });
});

// Admin PIN Verification Endpoint
app.post("/api/admin/verify", (req, res) => {
  try {
    const { pin } = req.body;
    if (isValidAdminPin(pin)) {
      return res.json({
        success: true,
        count: reservations.length,
        reservations,
        settings: academySettings,
      });
    } else {
      return res.status(401).json({
        success: false,
        error: "관리자 인증 정보가 올바르지 않습니다.",
      });
    }
  } catch (error: any) {
    return res.status(500).json({ error: "인증 처리 중 오류가 발생했습니다." });
  }
});

// Update Reservation Status (Admin only)
app.patch("/api/reservations/:id/status", (req, res) => {
  try {
    const pin = (req.headers['x-admin-pin'] as string) || (req.body.pin as string);
    if (!isValidAdminPin(pin)) {
      return res.status(401).json({ error: "관리자 권한이 필요합니다." });
    }

    const { id } = req.params;
    const { status } = req.body;
    const target = reservations.find((r) => r.id === id);

    if (!target) {
      return res.status(404).json({ error: "접수 내역을 찾을 수 없습니다." });
    }

    target.status = status;
    return res.json({ success: true, reservation: target });
  } catch (error: any) {
    return res.status(500).json({ error: "상태 업데이트 중 오류가 발생했습니다." });
  }
});

app.post("/api/reservations", async (req, res) => {
  try {
    const { studentName, parentPhone, school, grade, concerns = [], preferredDate, preferredTime, notes = '' } = req.body;

    if (!studentName || !parentPhone) {
      return res.status(400).json({ error: "학생 이름과 연락처는 필수 입력 항목입니다." });
    }

    const reservationId = `BB-REV-${Date.now().toString().slice(-6)}`;
    const schoolVal = school || '만수동 학교';
    const gradeVal = grade || '해당 학년';
    const concernsArr = Array.isArray(concerns) && concerns.length > 0 ? concerns : ['학교별 맞춤 내신 진단'];
    const dateVal = preferredDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const timeVal = preferredTime || '18:00';

    // Format Kakao message for director
    const kakaoNotifyMessage = `[빅뱅영어학원 상담예약 신규접수]\n` +
      `• 예약번호: ${reservationId}\n` +
      `• 학생: ${studentName} (${schoolVal} ${gradeVal})\n` +
      `• 학부모 연락처: ${parentPhone}\n` +
      `• 방문 희망일시: ${dateVal} ${timeVal}\n` +
      `• 주요 상담고민: ${concernsArr.join(', ')}\n` +
      (notes ? `• 추가 메모: ${notes}\n` : '') +
      `• 학원위치: 인천 남동구 만수서로 62 제이제이스타프라자 3층 301-305호\n` +
      `*원장님께 실시간 상담 예약 알림 전달 완료`;

    // Real-time automatic notification directly to director's phone (Telegram / Webhook)
    const notifySent = await dispatchDirectorNotification(kakaoNotifyMessage, {
      reservationId,
      studentName,
      parentPhone,
      school: schoolVal,
      grade: gradeVal,
      preferredDate: dateVal,
      preferredTime: timeVal,
      concerns: concernsArr,
      notes,
    });
    const kakaoNotified = notifySent;

    const newReservation: ReservationRecord = {
      id: reservationId,
      studentName,
      parentPhone,
      school: schoolVal,
      grade: gradeVal,
      concerns: concernsArr,
      preferredDate: dateVal,
      preferredTime: timeVal,
      notes,
      createdAt: new Date().toISOString(),
      status: '접수완료',
      kakaoNotified,
      kakaoNotifyMessage,
    };

    reservations.unshift(newReservation);

    res.status(201).json({
      success: true,
      reservation: newReservation,
      kakaoNotified,
      kakaoNotifyMessage,
      kakaoOpenChatUrl: academySettings.kakaoOpenChatUrl,
      autoOpenChatOnSubmit: academySettings.autoOpenChatOnSubmit,
      message: "무료 레벨테스트 및 1:1 컨설팅 예약이 성공적으로 접수되었습니다."
    });
  } catch (error: any) {
    console.error("Reservation error:", error);
    res.status(500).json({ error: "예약 접수 중 오류가 발생했습니다." });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BigBang English Academy Consultation Server running on port ${PORT}`);
  });
}

startServer();
