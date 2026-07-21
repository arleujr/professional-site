import { buildEmailPayload } from '../src/contact/email-template.js';
import { messages } from '../src/contact/messages.js';
import { validateContactPayload } from '../src/contact/validation.js';

const MAX_BODY_BYTES = 16_384;
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function jsonResponse(payload, status = 200, requestId, additionalHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...additionalHeaders,
  };

  if (requestId) headers['X-Request-ID'] = requestId;

  return new Response(JSON.stringify(payload), { status, headers });
}

function requestSizeFromHeader(request) {
  const rawLength = request.headers.get('content-length');
  if (!rawLength) return null;

  const parsedLength = Number(rawLength);
  return Number.isFinite(parsedLength) ? parsedLength : null;
}

function logDeliveryFailure({ requestId, event, upstreamStatus }) {
  console.error('Contact API delivery failure', {
    requestId,
    event,
    ...(upstreamStatus ? { upstreamStatus } : {}),
  });
}

export default {
  async fetch(request) {
    const requestId = crypto.randomUUID();
    const requestCopy = messages(request.headers.get('accept-language'));

    if (request.method !== 'POST') {
      return jsonResponse(
        { message: requestCopy.method, requestId },
        405,
        requestId,
        { Allow: 'POST' },
      );
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return jsonResponse({ message: requestCopy.contentType, requestId }, 415, requestId);
    }

    const declaredSize = requestSizeFromHeader(request);
    if (declaredSize !== null && declaredSize > MAX_BODY_BYTES) {
      return jsonResponse({ message: requestCopy.bodyTooLarge, requestId }, 413, requestId);
    }

    let rawBody;
    try {
      rawBody = await request.text();
    } catch {
      return jsonResponse({ message: requestCopy.body, requestId }, 400, requestId);
    }

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse({ message: requestCopy.bodyTooLarge, requestId }, 413, requestId);
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ message: requestCopy.body, requestId }, 400, requestId);
    }

    const copy = messages(body?.language);
    const validation = validateContactPayload(body);

    if (!validation.ok) {
      return jsonResponse({ message: copy[validation.error], requestId }, 400, requestId);
    }

    if (validation.spam) {
      return jsonResponse({ message: copy.received, requestId }, 200, requestId);
    }

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_TO_EMAIL || 'arleujr30@gmail.com';
    const sender = process.env.CONTACT_FROM_EMAIL || 'Arleu Junior Website <onboarding@resend.dev>';

    if (!apiKey) {
      return jsonResponse({ message: copy.unavailable, requestId }, 503, requestId);
    }

    const emailPayload = buildEmailPayload({
      data: validation.data,
      copy,
      sender,
      recipient,
    });

    let resendResponse;
    try {
      resendResponse = await globalThis.fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': requestId,
        },
        body: JSON.stringify(emailPayload),
      });
    } catch (error) {
      logDeliveryFailure({
        requestId,
        event: error instanceof Error ? error.name : 'UnknownNetworkError',
      });
      return jsonResponse({ message: copy.delivery, requestId }, 502, requestId);
    }

    if (resendResponse.status === 429) {
      logDeliveryFailure({ requestId, event: 'UpstreamRateLimit', upstreamStatus: 429 });
      return jsonResponse(
        { message: copy.busy, requestId },
        503,
        requestId,
        { 'Retry-After': resendResponse.headers.get('retry-after') || '60' },
      );
    }

    if (!resendResponse.ok) {
      logDeliveryFailure({
        requestId,
        event: 'UpstreamDeliveryError',
        upstreamStatus: resendResponse.status,
      });
      return jsonResponse({ message: copy.delivery, requestId }, 502, requestId);
    }

    return jsonResponse({ message: copy.success, requestId }, 200, requestId);
  },
};
