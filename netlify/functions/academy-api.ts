import { getDeployStore, getStore } from '@netlify/blobs';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const store = () => process.env.CONTEXT === 'production'
  ? getStore({ name: 'academy-reservations', consistency: 'strong' })
  : getDeployStore({ name: 'academy-reservations', consistency: 'strong' });
const adminStore = () => process.env.CONTEXT === 'production'
  ? getStore({ name: 'academy-admin', consistency: 'strong' })
  : getDeployStore({ name: 'academy-admin', consistency: 'strong' });
type Credential = { salt: string; hash: string; updatedAt: string };
const matchesCredential = (supplied: string, record: Credential) => {
  if (!/^[a-f0-9]{32}$/.test(record.salt) || !/^[a-f0-9]{128}$/.test(record.hash)) return false;
  const computed = scryptSync(supplied, Buffer.from(record.salt, 'hex'), 64);
  return timingSafeEqual(computed, Buffer.from(record.hash, 'hex'));
};
const matchesEnvironment = (supplied: string) => {
  const expected = process.env.ADMIN_PIN || '';
  const provided = Buffer.from(supplied);
  const original = Buffer.from(expected);
  const categoryCount = Number(/[A-Za-z]/.test(expected)) + Number(/[0-9]/.test(expected)) + Number(/[\p{P}\p{S}]/u.test(expected));
  return expected.length >= 8 && expected.length <= 128 && categoryCount >= 2 && provided.length === original.length && timingSafeEqual(provided, original);
};
const validAdmin = async (request: Request) => {
  const supplied = request.headers.get('x-admin-pin') || '';
  if (supplied.length < 8 || supplied.length > 128) return false;
  const record = await adminStore().get('credential', { type: 'json' }) as Credential | null;
  return record ? matchesCredential(supplied, record) : matchesEnvironment(supplied);
};
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const sameOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
};

export default async (request: Request) => {
  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const publicPath = parts[0] === 'api' ? parts.slice(1).join('/') : '';
    const route = url.searchParams.get('route') || (publicPath === 'reservations' ? 'reservations' : publicPath === 'admin/verify' ? 'verify' : publicPath === 'admin/change-password' ? 'change-password' : publicPath === 'admin/settings' ? 'admin-settings' : publicPath === 'admin/test-notify' ? 'test-notify' : publicPath === 'settings' ? 'settings' : /^reservations\/[^/]+\/status$/.test(publicPath) ? 'status' : /^reservations\/[^/]+\/test$/.test(publicPath) ? 'delete-test' : '');
    if (!route) return json({ error: 'Not found' }, 404);
    if (!sameOrigin(request)) return json({ error: '허용되지 않은 요청입니다.' }, 403);
    if (route === 'settings' && request.method === 'GET') return json({});
    if (route === 'admin-settings' || route === 'test-notify') {
      if (!(await validAdmin(request))) return json({ error: '관리자 인증이 필요합니다.' }, 401);
      if (route === 'admin-settings' && request.method === 'GET') return json({ smsEnabled: false, notificationStatus: '미설정' });
      return json({ error: '자동 알림은 연결되지 않았습니다.' }, 501);
    }
    if (route === 'change-password' && request.method === 'POST') {
      if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: '잘못된 요청입니다.' }, 415);
      const raw = await request.text();
      if (raw.length > 2048) return json({ error: '입력 내용이 너무 깁니다.' }, 413);
      const body = JSON.parse(raw);
      const currentPassword = body?.currentPassword;
      const newPassword = body?.newPassword;
      if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') return json({ error: '현재 비밀번호와 새 비밀번호를 입력해 주세요.' }, 400);
      if (!(await validAdmin(new Request(request.url, { headers: { 'x-admin-pin': currentPassword } })))) return json({ error: '현재 비밀번호가 올바르지 않습니다.' }, 401);
      const categoryCount = Number(/[A-Za-z]/.test(newPassword)) + Number(/[0-9]/.test(newPassword)) + Number(/[\p{P}\p{S}]/u.test(newPassword));
      if (newPassword.length < 8 || newPassword.length > 128 || newPassword !== newPassword.trim() || newPassword === currentPassword || categoryCount < 2) {
        return json({ error: '새 비밀번호는 8~128자이며 영문·숫자·특수문자 중 2종류 이상을 포함해야 합니다. 기존 비밀번호와 달라야 합니다.' }, 400);
      }
      const credentials = adminStore();
      const previous = await credentials.getWithMetadata('credential', { type: 'json' }) as { data: Credential; etag: string } | null;
      if (previous ? !matchesCredential(currentPassword, previous.data) : !matchesEnvironment(currentPassword)) {
        return json({ error: '비밀번호가 이미 변경되었습니다. 새로고침 후 다시 시도해 주세요.' }, 409);
      }
      const salt = randomBytes(16).toString('hex');
      const record: Credential = { salt, hash: scryptSync(newPassword, Buffer.from(salt, 'hex'), 64).toString('hex'), updatedAt: new Date().toISOString() };
      const { modified } = await credentials.setJSON('credential', record, previous ? { onlyIfMatch: previous.etag } : { onlyIfNew: true });
      if (!modified) return json({ error: '다른 변경이 먼저 저장되었습니다. 다시 시도해 주세요.' }, 409);
      const saved = await credentials.get('credential', { type: 'json' }) as Credential | null;
      if (!saved || !matchesCredential(newPassword, saved)) return json({ error: '변경 저장을 확인하지 못했습니다. 관리자에게 문의해 주세요.' }, 503);
      return json({ success: true });
    }
    if (route === 'verify' && request.method === 'POST') {
      const body = await request.json();
      const pin = clean(body?.pin, 256);
      const authorized = await validAdmin(new Request(request.url, { headers: { 'x-admin-pin': pin } }));
      if (!authorized) return json({ error: '관리자 비밀번호가 올바르지 않습니다.' }, 401);
      const reservations = await allReservations();
      return json({ success: true, reservations, count: reservations.length, settings: { smsEnabled: false } });
    }
    if (route === 'reservations' && request.method === 'GET') {
      const records = store();
      const entries = await records.list();
      if (!(await validAdmin(request))) return json({ count: entries.blobs.length, available: true });
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
      if (!studentName || !/^0[0-9 -]{7,18}$/.test(parentPhone) || !school || !grade || !preferredDate || !preferredTime) {
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
      if (!(await validAdmin(request))) return json({ error: '관리자 인증이 필요합니다.' }, 401);
      const id = url.searchParams.get('id') || parts[2] || '';
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
      if (!(await validAdmin(request))) return json({ error: '관리자 인증이 필요합니다.' }, 401);
      const id = url.searchParams.get('id') || parts[2] || '';
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