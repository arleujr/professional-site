# Changelog

## v2.5 — AgriSentry architecture and project cleanup

- Reframed AgriSentry around the active ecosystem repositories: Platform, Device, IoT Gateway, and Assembly Docs.
- Replaced the AgriSentry demo media with a visual architecture map linking the active modules.
- Moved AgriSentry Cotton to Other Projects without a lifecycle/status label.
- Removed standalone IoT Gateway and AgriSentry Core cards from Other Projects.
- Repositioned DevGuard as a security tool used across the portfolio projects to reduce accidental secret leakage.
- Updated PT-BR and English content and resume summaries.


## v2.4 — AgriSentry ecosystem and learning updates

- Reframed the featured AgriSentry project as an ecosystem spanning IoT, telemetry, Assembly Docs, and agronomic decision-support workflows.
- Updated GeCotton naming in Portuguese to “GeCotton UFV — Grupo de estudos em cotonicultura”.
- Renamed the learning card to “Em aprendizado” / “Currently Learning”.
- Added the selected Santander + DIO n8n automation program to the learning section.

## v2.2 — Hero first-fold refinement

- Keeps the technology marquee visible inside the first desktop viewport by making Hero + marquee equal 100svh.
- Fixes the accented “Júnior” line collision with explicit title lines and safer leading.
- Rewrites the floating Hero chips around stronger backend/data signals.
- Refines the current-focus card copy.
- Reduces the Contact headline scale for better hierarchy.


## 2026-08-18 — Visual refinement v2.1

- Removed the oversized decorative BACKEND word from the hero.
- Removed the oversized decorative PROCESS/PROCESSO word from About.
- Reduced the scrolling technology marquee height and typography.
- Refocused the marquee on interview-defensible backend/data technologies: Python, SQL, PostgreSQL, FastAPI, Docker, Git, TypeScript, REST APIs, and CI/CD.
- Moved About social icons below the photo instead of overlaying the image.
- Kept English and Portuguese versions synchronized.
# Changelog

All notable changes to this project are documented in this file.

## [1.2.0] - 2026-07-21

### Added

- Automated tests for contact validation, email templates, and the serverless endpoint.
- Mocked Resend delivery so tests never send real email.
- GitHub Actions CI for pushes and pull requests.
- Native Node.js coverage reporting.
- Dependabot configuration for npm and GitHub Actions.
- Security policy and vulnerability-reporting instructions.
- Request identifiers and privacy-safe delivery logs.

### Changed

- Refactored the contact endpoint into small validation, message, and email-template modules.
- Added request-size, network-error, upstream-error, and rate-limit handling.
- Updated the bilingual documentation with testing, CI, local API execution, and deployment workflows.
- Updated the package version to 1.2.0.

## [1.1.0] - 2026-07-21

### Added

- Complete English and Brazilian Portuguese versions.
- Updated professional content, projects, digital resume, and professional introduction.
- Serverless contact form with Resend.
- Optional project demonstrations using MP4 files.

### Changed

- Repositioned the site around junior backend development and data.
- Updated project descriptions and technical skills.
- Improved responsive navigation, SEO metadata, and print layouts.
