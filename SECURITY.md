# Security Policy

## Supported Versions

Since this project is in active development, only the latest version (main branch) receives security updates.

## Reporting a Vulnerability

The Text Processing Toolkit is a **100% client-side application**. No user data is ever transmitted or stored on any server. However, we still take security seriously.

If you discover a security vulnerability, **please do not open a public issue**. Instead, report it privately:

1. Go to [GitHub Security Advisories](https://github.com/anomalyco/TextProcessing-Toolkit/security/advisories/new)
2. Fill out the advisory form with details about the vulnerability

Alternatively, you can email the maintainer directly (see the [dev page](https://github.com/anomalyco/TextProcessing-Toolkit) for contact information).

### What to include

- Type of vulnerability (e.g., XSS, dependency issue, etc.)
- Steps to reproduce
- Affected component or tool
- Browser and OS versions
- Any proof-of-concept code (if applicable)

### Response timeline

- **Within 48 hours**: Acknowledgment of receipt
- **Within 7 days**: Initial assessment and plan
- **Within 30 days**: Fix released or mitigation communicated

## Security Considerations for This Project

- All processing happens client-side — no data ever reaches a server
- The application uses no analytics, tracking, or telemetry
- Cryptographic operations (bcrypt, AES, RSA) use well-audited libraries
- Dependencies are kept up-to-date with security patches
- The project uses a strict bun supply-chain security policy (24-hour minimum release age)

## Dependency Security

If you discover a vulnerability in a dependency, please report it via the same channels so we can update or patch it promptly.
