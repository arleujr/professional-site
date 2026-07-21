import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { buildEmailPayload, escapeHtml } from '../src/contact/email-template.js';
import { messages } from '../src/contact/messages.js';

describe('email template', () => {
  test('escapes HTML-sensitive characters', () => {
    assert.equal(
      escapeHtml(`<script>alert("x")</script> & 'test'`),
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#039;test&#039;',
    );
  });

  test('builds safe HTML and plain-text bodies', () => {
    const payload = buildEmailPayload({
      data: {
        name: '<Arleu>',
        email: 'arleu@example.com',
        company: '',
        subject: 'Hello & welcome',
        message: 'First line\n<script>unsafe</script>',
      },
      copy: messages('en'),
      sender: 'Website <sender@example.com>',
      recipient: 'owner@example.com',
    });

    assert.deepEqual(payload.to, ['owner@example.com']);
    assert.equal(payload.reply_to, 'arleu@example.com');
    assert.match(payload.html, /&lt;Arleu&gt;/);
    assert.match(payload.html, /&lt;script&gt;unsafe&lt;\/script&gt;/);
    assert.doesNotMatch(payload.html, /<script>/);
    assert.match(payload.text, /First line/);
  });
});
