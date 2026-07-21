const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: jsonHeaders });
}

function normalizeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n/g, '\n').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function messages(language) {
  const pt = String(language || '').toLowerCase().startsWith('pt');
  return pt
    ? {
        method: 'Método não permitido.',
        contentType: 'Tipo de conteúdo inválido.',
        body: 'Corpo da requisição inválido.',
        received: 'Mensagem recebida.',
        required: 'Preencha todos os campos obrigatórios.',
        email: 'Informe um endereço de e-mail válido.',
        session: 'Sessão do formulário inválida.',
        refresh: 'Atualize a página e tente novamente.',
        unavailable: 'O serviço de contato não está configurado.',
        delivery: 'A mensagem não pôde ser entregue.',
        success: 'Mensagem enviada com sucesso.',
        notInformed: 'Não informado',
        emailTitle: 'Nova mensagem pelo site',
        name: 'Nome',
        company: 'Empresa',
        subject: 'Assunto',
      }
    : {
        method: 'Method not allowed.',
        contentType: 'Invalid content type.',
        body: 'Invalid request body.',
        received: 'Message received.',
        required: 'Complete all required fields.',
        email: 'Enter a valid email address.',
        session: 'Invalid form session.',
        refresh: 'Refresh the page and try again.',
        unavailable: 'The contact service is not configured.',
        delivery: 'The message could not be delivered.',
        success: 'Message sent successfully.',
        notInformed: 'Not informed',
        emailTitle: 'New website message',
        name: 'Name',
        company: 'Company',
        subject: 'Subject',
      };
}

export default {
  async fetch(request) {
    const requestCopy = messages(request.headers.get('accept-language'));

    if (request.method !== 'POST') {
      return jsonResponse({ message: requestCopy.method }, 405);
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return jsonResponse({ message: requestCopy.contentType }, 415);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ message: requestCopy.body }, 400);
    }

    const copy = messages(body.language);
    const name = normalizeText(body.name, 80);
    const email = normalizeText(body.email, 120).toLowerCase();
    const company = normalizeText(body.company, 120);
    const subject = normalizeText(body.subject, 140);
    const message = normalizeText(body.message, 3000);
    const website = normalizeText(body.website, 200);
    const startedAt = Number(body.startedAt);

    if (website) return jsonResponse({ message: copy.received });
    if (!name || !email || !subject || !message) return jsonResponse({ message: copy.required }, 400);
    if (!isValidEmail(email)) return jsonResponse({ message: copy.email }, 400);
    if (!Number.isFinite(startedAt)) return jsonResponse({ message: copy.session }, 400);

    const elapsed = Date.now() - startedAt;
    if (elapsed < 2000 || elapsed > 7200000) return jsonResponse({ message: copy.refresh }, 400);

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_TO_EMAIL || 'arleujr30@gmail.com';
    const sender = process.env.CONTACT_FROM_EMAIL || 'Arleu Junior Website <onboarding@resend.dev>';

    if (!apiKey) return jsonResponse({ message: copy.unavailable }, 503);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCompany = escapeHtml(company || copy.notInformed);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replaceAll('\n', '<br>');

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: email,
        subject: `Website contact: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17211c; max-width: 680px; margin: 0 auto;">
            <h1 style="font-size: 24px; margin-bottom: 24px;">${copy.emailTitle}</h1>
            <p><strong>${copy.name}:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>${copy.company}:</strong> ${safeCompany}</p>
            <p><strong>${copy.subject}:</strong> ${safeSubject}</p>
            <div style="margin-top: 24px; padding: 20px; background: #f3f7f5; border-radius: 12px;">${safeMessage}</div>
          </div>
        `,
        text: `${copy.name}: ${name}\nEmail: ${email}\n${copy.company}: ${company || copy.notInformed}\n${copy.subject}: ${subject}\n\n${message}`,
      }),
    });

    if (!resendResponse.ok) return jsonResponse({ message: copy.delivery }, 502);
    return jsonResponse({ message: copy.success }, 200);
  },
};
