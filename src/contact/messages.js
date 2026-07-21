export function messages(language) {
  const isPortuguese = String(language || '').toLowerCase().startsWith('pt');

  return isPortuguese
    ? {
        method: 'Método não permitido.',
        contentType: 'Tipo de conteúdo inválido.',
        body: 'Corpo da requisição inválido.',
        bodyTooLarge: 'A mensagem enviada excede o limite permitido.',
        received: 'Mensagem recebida.',
        required: 'Preencha todos os campos obrigatórios.',
        email: 'Informe um endereço de e-mail válido.',
        session: 'Sessão do formulário inválida.',
        refresh: 'Atualize a página e tente novamente.',
        unavailable: 'O serviço de contato não está configurado.',
        busy: 'O serviço de contato está temporariamente indisponível. Tente novamente em alguns minutos.',
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
        bodyTooLarge: 'The submitted message exceeds the allowed size.',
        received: 'Message received.',
        required: 'Complete all required fields.',
        email: 'Enter a valid email address.',
        session: 'Invalid form session.',
        refresh: 'Refresh the page and try again.',
        unavailable: 'The contact service is not configured.',
        busy: 'The contact service is temporarily unavailable. Try again in a few minutes.',
        delivery: 'The message could not be delivered.',
        success: 'Message sent successfully.',
        notInformed: 'Not informed',
        emailTitle: 'New website message',
        name: 'Name',
        company: 'Company',
        subject: 'Subject',
      };
}
