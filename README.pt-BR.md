# Arleu Júnior — Site Profissional

[![CI](https://github.com/arleujr/professional-site/actions/workflows/ci.yml/badge.svg)](https://github.com/arleujr/professional-site/actions/workflows/ci.yml)
[![Site publicado](https://img.shields.io/badge/Site-Vercel-000000?logo=vercel)](https://professional-site-ashen.vercel.app/)

Site profissional bilíngue que reúne minha apresentação, projetos selecionados, experiências, currículo digital, apresentação profissional e canais de contato.

English documentation: [README.md](README.md)

## Site publicado

[professional-site-ashen.vercel.app](https://professional-site-ashen.vercel.app/)

## Sobre o projeto

O site apresenta minha transição da Agronomia para desenvolvimento backend e dados, com destaque para software aplicado a contextos agrícolas, acadêmicos e operacionais.

A interface foi desenvolvida com HTML semântico, CSS e JavaScript puro, sem framework frontend ou etapa de build. Um endpoint serverless valida os envios do formulário e encaminha os e-mails pelo Resend.

## Principais funcionalidades

- Versões completas em inglês e português brasileiro
- Navegação responsiva para computadores e dispositivos móveis
- Projetos selecionados com links para os repositórios e demonstrações MP4 opcionais
- Seções expansíveis de experiência profissional
- Filtro de projetos por categoria
- Currículo digital e apresentação profissional preparados para impressão
- Metadados de SEO, Open Graph, JSON-LD e `hreflang`
- Formulário de contato implementado com Vercel Function e Resend
- Testes automatizados da API com simulação do serviço externo
- Validação com GitHub Actions em pushes e pull requests

## Qualidade e segurança

O endpoint de contato possui:

- validação do método da requisição e do tipo de conteúdo;
- limite de 16 KB para o corpo da requisição;
- validação de campos obrigatórios e endereço de e-mail;
- honeypot e verificação do tempo de preenchimento contra envios básicos de bots;
- escape de HTML no conteúdo do e-mail;
- chave de idempotência nas requisições ao Resend;
- tratamento de falhas de rede, erros do provedor e limite de requisições;
- identificador de requisição e logs sem os dados pessoais enviados no formulário.

Os testes utilizam variáveis falsas e simulam a API do Resend. Nenhum e-mail real é enviado durante a suíte de testes.

## Estrutura principal

```text
professional-site/
├── .github/
│   ├── workflows/ci.yml
│   └── dependabot.yml
├── api/
│   └── contact.js
├── src/contact/
│   ├── email-template.js
│   ├── messages.js
│   └── validation.js
├── tests/
│   ├── contact.test.js
│   ├── email-template.test.js
│   └── validation.test.js
├── assets/
├── pt-br/
├── index.html
├── resume.html
├── cover-letter.html
├── README.md
└── README.pt-BR.md
```

## Executar localmente

Node.js 20 ou mais recente é necessário para os testes da API. As páginas estáticas não exigem instalação de dependências nem etapa de build.

Para visualizar as páginas:

```bash
python -m http.server 5500
```

Abra `http://localhost:5500`.

Para instalar o ambiente reproduzível e executar todas as verificações:

```bash
npm ci
npm run check
npm run test:coverage
```

## Formulário de contato

Copie `.env.example` para `.env.local` e configure:

```text
RESEND_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
```

Para executar o site e a Vercel Function localmente:

```bash
npx vercel dev
```

O endpoint está implementado em `api/contact.js`. As regras de validação e geração do e-mail ficam isoladas em `src/contact/`, permitindo testes sem chamar o provedor real.

## CI e publicação

O GitHub Actions executa a validação do projeto e os testes automatizados em pushes para `main` e em pull requests. A integração do Git com a Vercel continua responsável pelos ambientes de preview e produção:

```text
branch ou pull request → verificações de CI → preview da Vercel → merge → produção
```

O workflow de CI não armazena nem utiliza a chave real do Resend.

## Segurança

Consulte [SECURITY.md](SECURITY.md) para conhecer o processo de relato de vulnerabilidades e a política de proteção de segredos.

## Autor

**Arleu Pires da Silva Júnior**

- [Portfólio](https://professional-site-ashen.vercel.app/)
- [GitHub](https://github.com/arleujr)
- [LinkedIn](https://www.linkedin.com/in/arleujunior/)
