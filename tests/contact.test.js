import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';

import contactHandler from '../api/contact.js';

const originalFetch = globalThis.fetch;
const originalEnv = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
};

function payload(overrides = {}) {
  return {
    language: 'en',
    name: 'Arleu Junior',
    email: 'arleu@example.com',
    company: 'Example Company',
    subject: 'Backend opportunity',
    message: 'Hello from the contact form.',
    website: '',
    startedAt: Date.now() - 5_000,
    ...overrides,
  };
}

function request(body = payload(), options = {}) {
  return new Request('http://localhost/api/contact', {
    method: options.method || 'POST',
    headers: {
      'Content-Type': options.contentType || 'application/json',
      'Accept-Language': options.language || 'en-US',
      ...options.headers,
    },
    body: options.method === 'GET' ? undefined : options.rawBody ?? JSON.stringify(body),
  });
}

async function responseBody(response) {
  return response.json();
}

describe('contact API', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 'fake_test_key';
    process.env.CONTACT_TO_EMAIL = 'owner@example.com';
    process.env.CONTACT_FROM_EMAIL = 'Website <sender@example.com>';
    globalThis.fetch = async () => new Response(JSON.stringify({ id: 'fake_email_id' }), { status: 200 });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;

    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  test('rejects methods other than POST', async () => {
    const response = await contactHandler.fetch(request(undefined, { method: 'GET' }));

    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'POST');
  });

  test('rejects unsupported content types', async () => {
    const response = await contactHandler.fetch(request(payload(), { contentType: 'text/plain' }));
    assert.equal(response.status, 415);
  });

  test('rejects malformed JSON', async () => {
    const response = await contactHandler.fetch(request(undefined, { rawBody: '{invalid-json' }));
    assert.equal(response.status, 400);
  });

  test('rejects bodies larger than 16 KB', async () => {
    const largeBody = JSON.stringify(payload({ message: 'x'.repeat(17_000) }));
    const response = await contactHandler.fetch(request(undefined, { rawBody: largeBody }));

    assert.equal(response.status, 413);
  });

  test('returns localized validation messages', async () => {
    const response = await contactHandler.fetch(
      request(payload({ email: 'invalid', language: 'pt-BR' }), { language: 'pt-BR' }),
    );
    const body = await responseBody(response);

    assert.equal(response.status, 400);
    assert.equal(body.message, 'Informe um endereço de e-mail válido.');
  });

  test('accepts honeypot submissions without calling Resend', async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return new Response(null, { status: 200 });
    };

    const response = await contactHandler.fetch(request(payload({ website: 'bot-value' })));

    assert.equal(response.status, 200);
    assert.equal(calls, 0);
  });

  test('returns 503 when the contact service is not configured', async () => {
    delete process.env.RESEND_API_KEY;
    const response = await contactHandler.fetch(request());

    assert.equal(response.status, 503);
  });

  test('sends a safe request to Resend and returns 200', async () => {
    let capturedUrl;
    let capturedOptions;

    globalThis.fetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return new Response(JSON.stringify({ id: 'fake_email_id' }), { status: 200 });
    };

    const response = await contactHandler.fetch(
      request(payload({ name: '<Arleu>', message: '<script>unsafe</script>' })),
    );
    const body = await responseBody(response);
    const outbound = JSON.parse(capturedOptions.body);

    assert.equal(response.status, 200);
    assert.equal(body.message, 'Message sent successfully.');
    assert.equal(capturedUrl, 'https://api.resend.com/emails');
    assert.equal(capturedOptions.headers.Authorization, 'Bearer fake_test_key');
    assert.match(capturedOptions.headers['Idempotency-Key'], /^[0-9a-f-]{36}$/i);
    assert.match(outbound.html, /&lt;Arleu&gt;/);
    assert.doesNotMatch(outbound.html, /<script>/);
    assert.deepEqual(outbound.to, ['owner@example.com']);
  });

  test('returns 502 when the email provider cannot be reached', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('network unavailable');
    };

    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      const response = await contactHandler.fetch(request());
      assert.equal(response.status, 502);
    } finally {
      console.error = originalConsoleError;
    }
  });

  test('returns 502 when the email provider rejects delivery', async () => {
    globalThis.fetch = async () => new Response(null, { status: 500 });

    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      const response = await contactHandler.fetch(request());
      assert.equal(response.status, 502);
    } finally {
      console.error = originalConsoleError;
    }
  });

  test('returns 503 and Retry-After when the provider rate-limits delivery', async () => {
    globalThis.fetch = async () => new Response(null, {
      status: 429,
      headers: { 'Retry-After': '30' },
    });

    const originalConsoleError = console.error;
    console.error = () => {};
    try {
      const response = await contactHandler.fetch(request());
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('retry-after'), '30');
    } finally {
      console.error = originalConsoleError;
    }
  });
});
