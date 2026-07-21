# Arleu Júnior — Professional Site

Bilingual professional website containing my introduction, selected projects, experience, digital resume, professional introduction, and contact channels.

Portuguese documentation: [README.pt-BR.md](README.pt-BR.md)

## Live site

[professional-site-ashen.vercel.app](https://professional-site-ashen.vercel.app/)

## About the project

The site presents my transition from Agronomy to backend development and data, with emphasis on software applied to agricultural, academic, and operational contexts.

The interface uses semantic HTML, CSS, and vanilla JavaScript. It does not require a frontend framework or build step.

## Main features

- Complete English and Brazilian Portuguese versions
- Responsive navigation for desktop and mobile devices
- Selected projects with repository links and optional MP4 demonstrations
- Expandable professional-experience sections
- Project filtering by category
- Digital resume and professional introduction prepared for printing
- SEO, Open Graph, JSON-LD, and `hreflang` metadata
- Contact form implemented with a Vercel Function and Resend

## Main structure

```text
professional-site/
├── api/
│   └── contact.js
├── assets/
│   ├── css/
│   ├── img/
│   ├── js/
│   └── video/
├── pt-br/
│   ├── index.html
│   ├── resume.html
│   └── cover-letter.html
├── index.html
├── resume.html
├── cover-letter.html
├── README.md
└── README.pt-BR.md
```

## Run locally

No dependency installation or build command is required to view the pages.

```bash
python -m http.server 5500
```

Open `http://localhost:5500`.

The contact form requires a Vercel-compatible local or deployed environment.

## Contact form

Copy `.env.example` and configure:

```text
RESEND_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
```

The form endpoint is implemented in `api/contact.js`.

## Optional project videos

The site works with the poster images when the MP4 files are unavailable. To enable the demonstrations, add these files to `assets/video/`:

```text
agrisentry-demo.mp4
refengine-demo.mp4
tccbuilder-demo.mp4
```

## Deployment

The project is configured for static deployment on Vercel, with the contact endpoint handled as a serverless function.

1. Import the repository into Vercel.
2. Select **Other** as the framework preset.
3. Leave the build command empty.
4. Configure the contact-form environment variables.
5. Deploy from the repository root.

## Author

**Arleu Pires da Silva Júnior**

- [Portfolio](https://professional-site-ashen.vercel.app/)
- [GitHub](https://github.com/arleujr)
- [LinkedIn](https://www.linkedin.com/in/arleujunior/)
