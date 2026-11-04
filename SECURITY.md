# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Active |

## Reporting a Vulnerability

If you discover a security vulnerability in BugTracker Pro, please report it responsibly.

**DO NOT** open a public GitHub issue for security vulnerabilities.

### How to Report

1. **Email:** Send details to `siva0225@gmail.com`
2. **Subject:** `[SECURITY] BugTracker Pro — Brief Description`
3. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix development | Within 14 days for critical issues |
| Public disclosure | After fix is released |

### Security Measures Already in Place

- JWT authentication with expiring tokens
- bcrypt password hashing (12 salt rounds)
- Rate limiting on authentication endpoints
- Helmet HTTP security headers
- CORS origin restriction
- Input validation via express-validator
- Sort field injection prevention (whitelist)
- Pagination limit cap (DoS prevention)
- Role enforcement on registration (privilege escalation blocked)
- File upload type and size validation

### Scope

The following are in scope for security reports:

- Authentication/authorization bypass
- SQL/NoSQL injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Remote Code Execution
- Sensitive data exposure
- Privilege escalation

### Out of Scope

- Denial of service via rate limiting (already mitigated)
- Issues in dependencies (report to upstream)
- Social engineering attacks
- Physical security

## Acknowledgments

We appreciate responsible disclosure and will credit security researchers
(with permission) in our release notes.
