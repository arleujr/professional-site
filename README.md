# Arleu Júnior — Professional Site

[![CI](https://github.com/arleujr/professional-site/actions/workflows/ci.yml/badge.svg)](https://github.com/arleujr/professional-site/actions/workflows/ci.yml)
[![Live Site](https://img.shields.io/badge/Live-Vercel-000000?logo=vercel)](https://professional-site-ashen.vercel.app/)

Bilingual professional website containing my introduction, selected projects, experience, digital resume, professional introduction, and contact channels.

Portuguese documentation: [README.pt-BR.md](README.pt-BR.md)

## Live site

[professional-site-ashen.vercel.app](https://professional-site-ashen.vercel.app/)

## About the project

The site presents my transition from Agronomy to backend development and data, with emphasis on software applied to agricultural, academic, and operational contexts.

The interface was built with semantic HTML, CSS, and vanilla JavaScript, without a frontend framework or build step. A serverless contact endpoint validates submissions and sends email through Resend.

## Main features

- Complete English and Brazilian Portuguese versions
- Responsive navigation for desktop and mobile devices
- Selected projects with repository links and optional MP4 demonstrations
- Expandable professional-experience sections
- Project filtering by category
- Digital resume and professional introduction prepared for printing
- SEO, Open Graph, JSON-LD, and `hreflang` metadata
- Contact form implemented with a Vercel Function and Resend
- Automated API tests with mocked external delivery
- GitHub Actions validation on pushes and pull requests

## Quality and security

The contact endpoint includes:

- request method and content-type validation;
- a 16 KB request-body limit;
- required-field and email validation;
- honeypot and form-timing checks against basic bot submissions;
- HTML escaping for email content;
- idempotency keys for Resend requests;
- network, upstream failure, and rate-limit handling;
- request IDs and logs without submitted personal data.

Automated tests use fake environment variables and mock the Resend API. No real email is sent during the test suite.

## Main structure

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

## Run locally

Node.js 20 or newer is required for the API tests. The static pages do not require dependency installation or a build step.

To view the pages:

```bash
python -m http.server 5500
```

Open `http://localhost:5500`.

To install the reproducible development environment and run all checks:

```bash
npm ci
npm run check
npm run test:coverage
```

## Contact form

Copy `.env.example` to `.env.local` and configure:

```text
RESEND_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
```

To run the website and the Vercel Function locally:

```bash
npx vercel dev
```

The endpoint is implemented in `api/contact.js`. Validation and email-template rules are isolated in `src/contact/` so they can be tested without calling the real provider.

## CI and deployment

GitHub Actions runs project validation and automated tests on pushes to `main` and on pull requests. The Vercel Git integration remains responsible for preview and production deployments:

```text
branch or pull request → CI checks → Vercel preview → merge → production deployment
```

The CI workflow does not store or use the production Resend key.

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability-reporting process and secret-handling policy.

## Author

**Arleu Pires da Silva Júnior**

- [Portfolio](https://professional-site-ashen.vercel.app/)
- [GitHub](https://github.com/arleujr)
- [LinkedIn](https://www.linkedin.com/in/arleujunior/)
