const MIN_FORM_TIME_MS = 2_000;
const MAX_FORM_AGE_MS = 7_200_000;

export function normalizeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n?/g, '\n').trim().slice(0, maxLength);
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateContactPayload(body, now = Date.now()) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'body' };
  }

  const data = {
    language: normalizeText(body.language, 12),
    name: normalizeText(body.name, 80),
    email: normalizeText(body.email, 120).toLowerCase(),
    company: normalizeText(body.company, 120),
    subject: normalizeText(body.subject, 140),
    message: normalizeText(body.message, 3_000),
    website: normalizeText(body.website, 200),
    startedAt: Number(body.startedAt),
  };

  if (data.website) {
    return { ok: true, spam: true, data };
  }

  if (!data.name || !data.email || !data.subject || !data.message) {
    return { ok: false, error: 'required' };
  }

  if (!isValidEmail(data.email)) {
    return { ok: false, error: 'email' };
  }

  if (!Number.isFinite(data.startedAt)) {
    return { ok: false, error: 'session' };
  }

  const elapsed = now - data.startedAt;
  if (elapsed < MIN_FORM_TIME_MS || elapsed > MAX_FORM_AGE_MS) {
    return { ok: false, error: 'refresh' };
  }

  return { ok: true, spam: false, data };
}
