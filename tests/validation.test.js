import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  isValidEmail,
  normalizeText,
  validateContactPayload,
} from '../src/contact/validation.js';

const now = 2_000_000_000_000;

function validPayload(overrides = {}) {
  return {
    language: 'en',
    name: 'Arleu Junior',
    email: 'ARLEU@example.com',
    company: 'Example',
    subject: 'Backend opportunity',
    message: 'Hello from the test suite.',
    website: '',
    startedAt: now - 5_000,
    ...overrides,
  };
}

describe('contact payload validation', () => {
  test('normalizes line endings, trims text, and limits length', () => {
    assert.equal(normalizeText('  a\r\nb\r  ', 3), 'a\nb');
  });

  test('validates common email addresses', () => {
    assert.equal(isValidEmail('arleu@example.com'), true);
    assert.equal(isValidEmail('invalid-address'), false);
  });

  test('returns normalized data for a valid payload', () => {
    const result = validateContactPayload(validPayload(), now);

    assert.equal(result.ok, true);
    assert.equal(result.spam, false);
    assert.equal(result.data.email, 'arleu@example.com');
  });

  test('accepts honeypot submissions without processing delivery', () => {
    const result = validateContactPayload(validPayload({ website: 'https://spam.example' }), now);

    assert.equal(result.ok, true);
    assert.equal(result.spam, true);
  });

  test('rejects missing fields, invalid email, invalid session, and timing anomalies', () => {
    assert.equal(validateContactPayload(validPayload({ name: '' }), now).error, 'required');
    assert.equal(validateContactPayload(validPayload({ email: 'invalid' }), now).error, 'email');
    assert.equal(validateContactPayload(validPayload({ startedAt: 'invalid' }), now).error, 'session');
    assert.equal(validateContactPayload(validPayload({ startedAt: now - 500 }), now).error, 'refresh');
    assert.equal(validateContactPayload(validPayload({ startedAt: now - 8_000_000 }), now).error, 'refresh');
  });
});
