/**
 * KakaoTalk & SMS Communication Utility
 * Reliable, zero-error direct messaging for mobile & web.
 */

export interface ReservationShareData {
  id: string;
  studentName: string;
  parentPhone: string;
  school: string;
  grade: string;
  preferredDate: string;
  preferredTime: string;
  concerns?: string[];
  notes?: string;
}

/**
 * Format reservation into a clean, professional consultation message
 */
export function formatReservationText(reservation: ReservationShareData): string {
  const concernsText = (reservation.concerns || []).join(', ') || '내신 기출 분석 및 1:1 진단';
  return (
    `[빅뱅영어학원 무료 레벨테스트 예약 접수]\n` +
    `• 예약번호: ${reservation.id}\n` +
    `• 학생명: ${reservation.studentName} (${reservation.school} ${reservation.grade})\n` +
    `• 학부모 연락처: ${reservation.parentPhone}\n` +
    `• 희망일시: ${reservation.preferredDate} ${reservation.preferredTime}\n` +
    `• 주요고민: ${concernsText}\n` +
    (reservation.notes ? `• 추가요청: ${reservation.notes}\n` : '') +
    `• 학원위치: 만수서로 62 제이제이스타프라자 3층 (032-471-7525)`
  );
}

/**
 * Generate 1-tap SMS URL for mobile devices
 * Opens native SMS app with director phone and reservation text pre-populated
 */
export function getDirectSmsUrl(
  reservation: ReservationShareData,
  phoneNumber: string = '010-2006-7525'
): string {
  const msg = formatReservationText(reservation);
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '') || '0324717525';
  return `sms:${cleanNumber}?body=${encodeURIComponent(msg)}`;
}

/**
 * Open KakaoTalk Directly without failing domain authentication
 * Copies receipt to clipboard and opens the academy's official KakaoTalk room directly.
 */
export function openKakaoConsultation(
  reservation: ReservationShareData,
  kakaoUrl: string = 'https://open.kakao.com/o/sgKXFMMi'
): boolean {
  const msg = formatReservationText(reservation);
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(msg).catch(() => {});
  }
  
  if (typeof window !== 'undefined') {
    const targetUrl = kakaoUrl || 'https://open.kakao.com/o/sgKXFMMi';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    return true;
  }
  return false;
}
