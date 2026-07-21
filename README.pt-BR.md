# Arleu Júnior — Site Profissional

Site profissional bilíngue que reúne minha apresentação, projetos selecionados, experiências, currículo digital, apresentação profissional e canais de contato.

English documentation: [README.md](README.md)

## Site publicado

[professional-site-ashen.vercel.app](https://professional-site-ashen.vercel.app/)

## Sobre o projeto

O site apresenta minha transição da Agronomia para desenvolvimento backend e dados, com destaque para software aplicado a contextos agrícolas, acadêmicos e operacionais.

A interface utiliza HTML semântico, CSS e JavaScript puro. Não é necessário usar framework frontend nem executar uma etapa de build.

## Principais funcionalidades

- Versões completas em inglês e português brasileiro
- Navegação responsiva para computadores e dispositivos móveis
- Projetos selecionados com links para os repositórios e demonstrações MP4 opcionais
- Seções expansíveis de experiência profissional
- Filtro de projetos por categoria
- Currículo digital e apresentação profissional preparados para impressão
- Metadados de SEO, Open Graph, JSON-LD e `hreflang`
- Formulário de contato implementado com Vercel Function e Resend

## Estrutura principal

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

## Executar localmente

Não é necessário instalar dependências nem executar uma etapa de build para visualizar as páginas.

```bash
python -m http.server 5500
```

Abra `http://localhost:5500`.

O formulário de contato exige um ambiente local ou publicado compatível com a Vercel.

## Formulário de contato

Copie `.env.example` e configure:

```text
RESEND_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
```

O endpoint do formulário está implementado em `api/contact.js`.

## Vídeos opcionais dos projetos

O site funciona com as imagens de capa quando os arquivos MP4 não estão disponíveis. Para ativar as demonstrações, adicione estes arquivos em `assets/video/`:

```text
agrisentry-demo.mp4
refengine-demo.mp4
tccbuilder-demo.mp4
```

## Publicação

O projeto está configurado para publicação estática na Vercel, com o endpoint de contato executado como função serverless.

1. Importe o repositório na Vercel.
2. Selecione **Other** como framework.
3. Deixe o comando de build vazio.
4. Configure as variáveis de ambiente do formulário.
5. Publique a partir da raiz do repositório.

## Autor

**Arleu Pires da Silva Júnior**

- [Portfólio](https://professional-site-ashen.vercel.app/)
- [GitHub](https://github.com/arleujr)
- [LinkedIn](https://www.linkedin.com/in/arleujunior/)
