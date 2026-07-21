export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function buildEmailPayload({ data, copy, sender, recipient }) {
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safeCompany = escapeHtml(data.company || copy.notInformed);
  const safeSubject = escapeHtml(data.subject);
  const safeMessage = escapeHtml(data.message).replaceAll('\n', '<br>');

  return {
    from: sender,
    to: [recipient],
    reply_to: data.email,
    subject: `Website contact: ${data.subject}`,
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
    text: `${copy.name}: ${data.name}\nEmail: ${data.email}\n${copy.company}: ${data.company || copy.notInformed}\n${copy.subject}: ${data.subject}\n\n${data.message}`,
  };
}
