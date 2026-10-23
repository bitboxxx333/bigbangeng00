import { getDeployStore, getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const store = () => process.env.CONTEXT === 'production'
  ? getStore({ name: 'academy-reservations', consistency: 'strong' })
  : getDeployStore({ name: 'academy-reservations', consistency: 'strong' });
const validAdmin = (request: Request) => {
  const expected = process.env.ADMIN_PIN || '';
  const supplied = request.headers.get('x-admin-pin') || '';
  if (expected.length < 16 || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
};
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const sameOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
};

export default async (request: Request) => {
  try {
    const url = new URL(request.url);
    const route = url.searchParams.get('route');
    if (!route) return json({ error: 'Not found' }, 404);
    if (!sameOrigin(request)) return json({ error: '허용되지 않은 요청입니다.' }, 403);
    if (route === 'settings' && request.method === 'GET') return json({});
    if (route === 'admin-settings' || route === 'test-notify') {
      if (!validAdmin(request)) return json({ error: '관리자 인증이 필요합니다.' }, 401);
      if (route === 'admin-settings' && request.method === 'GET') return json({ smsEnabled: false, notificationStatus: '미설정' });
      return json({ error: '자동 알림은 연결되지 않았습니다.' }, 501);
    }
    if (route === 'verify' && request.method === 'POST') {
      const body = await request.json();
      const pin = clean(body?.pin, 256);
      const authorized = validAdmin(new Request(request.url, { headers: { 'x-admin-pin': pin } }));
      if (!authorized) return json({ error: '관리자 비밀번호가 올바르지 않습니다.' }, 401);
      const reservations = await allReservations();
      return json({ success: true, reservations, count: reservations.length, settings: { smsEnabled: false } });
    }
    if (route === 'reservations' && request.method === 'GET') {
      const records = store();
      const entries = await records.list();
      if (!validAdmin(request)) return json({ count: entries.blobs.length, available: true });
      const reservations = await Promise.all(entries.blobs.map(({ key }) => records.get(key, { type: 'json' })));
      const sorted = reservations.filter(Boolean).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
      return json({ count: sorted.length, reservations: sorted, authorized: true, available: true });
    }
    if (route === 'reservations' && request.method === 'POST') {
      if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: '잘못된 요청입니다.' }, 415);
      const raw = await request.text();
      if (raw.length > 10000) return json({ error: '입력 내용이 너무 깁니다.' }, 413);
      const body = JSON.parse(raw);
      const studentName = clean(body.studentName, 60);
      const parentPhone = clean(body.parentPhone, 30);
      const school = clean(body.school, 60);
      const grade = clean(body.grade, 50);
      const preferredDate = clean(body.preferredDate, 40);
      const preferredTime = clean(body.preferredTime, 40);
      const notes = clean(body.notes, 1000);
      const concerns = Array.isArray(body.concerns) ? body.concerns.slice(0, 12).map((v: unknown) => clean(v, 120)).filter(Boolean) : [];
      if (!studentName || !/^0[0-9 -]{7,18}$/.test(parentPhone) || !school || !grade || !preferredDate || !preferredTime || !concerns.length) {
        return json({ error: '필수 항목과 연락처를 확인해 주세요.' }, 400);
      }
      if (preferredDate !== '일정 협의' && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) return json({ error: '희망 날짜를 확인해 주세요.' }, 400);
      const id = crypto.randomUUID();
      const reservation = { id, studentName, parentPhone, school, grade, preferredDate, preferredTime, notes, concerns, createdAt: new Date().toISOString(), status: '접수완료', kakaoNotified: false, kakaoNotifyMessage: '문자 미발송 (자동 알림 미설정)' };
      const records = store();
      const { modified } = await records.setJSON(id, reservation, { onlyIfNew: true });
      if (!modified) return json({ error: '접수 저장에 실패했습니다. 다시 시도해 주세요.' }, 503);
      const persisted = await records.get(id, { type: 'json' });
      if (!persisted || persisted.id !== id) return json({ error: '접수 저장을 확인하지 못했습니다. 학원에 연락해 주세요.' }, 503);
      return json({ reservation: persisted, notificationStatus: 'not_sent' }, 201);
    }
    if (route === 'status' && request.method === 'PATCH') {
      if (!validAdmin(request)) return json({ error: '관리자 인증이 필요합니다.' }, 401);
      const id = url.searchParams.get('id') || '';
      if (!/^[0-9a-f-]{36}$/.test(id)) return json({ error: '잘못된 접수번호입니다.' }, 400);
      const body = await request.json();
      if (!['접수완료', '상담대기', '확정'].includes(body?.status)) return json({ error: '잘못된 상태입니다.' }, 400);
      const records = store();
      const existing = await records.getWithMetadata(id, { type: 'json' });
      if (!existing) return json({ error: '접수 내역을 찾을 수 없습니다.' }, 404);
      const updated = { ...existing.data, status: body.status };
      const { modified } = await records.setJSON(id, updated, { onlyIfMatch: existing.etag });
      if (!modified) return json({ error: '상태가 변경되어 다시 조회해야 합니다.' }, 409);
      return json({ reservation: updated });
    }
    if (route === 'delete-test' && request.method === 'DELETE') {
      if (!validAdmin(request)) return json({ error: '관리자 인증이 필요합니다.' }, 401);
      const id = url.searchParams.get('id') || '';
      if (!/^[0-9a-f-]{36}$/.test(id)) return json({ error: '잘못된 접수번호입니다.' }, 400);
      const records = store();
      const record = await records.get(id, { type: 'json' });
      if (!record || !record.studentName.startsWith('TEST-')) return json({ error: '테스트 접수만 삭제할 수 있습니다.' }, 403);
      await records.delete(id);
      return json({ deleted: true });
    }
    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('Reservation API error', error instanceof Error ? error.message : 'unknown');
    return json({ error: '접수 서비스에 오류가 발생했습니다. 전화 또는 카카오톡으로 문의해 주세요.' }, 503);
  }
};

async function allReservations() {
  const records = store();
  const { blobs } = await records.list();
  const values = await Promise.all(blobs.map(({ key }) => records.get(key, { type: 'json' })));
  return values.filter(Boolean).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
}
