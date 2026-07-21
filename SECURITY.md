# Security Policy

## Supported version

Security fixes are applied to the latest version published from the `main` branch.

| Version | Supported |
| --- | --- |
| 1.2.x | Yes |
| Earlier versions | No |

## Reporting a vulnerability

Do not open a public issue containing credentials, personal data, or a working exploit.

Report a suspected vulnerability privately by email:

- arleujr30@gmail.com

Include the affected file or endpoint, reproduction steps, expected impact, and any suggested mitigation. Sensitive values should be removed from screenshots and logs.

## Secrets and personal data

- Resend credentials are stored only in environment variables.
- `.env` files are ignored by Git.
- Automated tests use fake credentials and mock the external email provider.
- Contact API logs contain request identifiers and error categories, not submitted names, email addresses, or messages.
