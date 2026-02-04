# Security Guidelines for ANCHOR Security Dashboard

## Overview
This document outlines the security measures, best practices, and guidelines for the ANCHOR security dashboard application. All developers must follow these guidelines to maintain the security posture of this sensitive security scanning platform.

## Table of Contents
1. [Sensitive Data Handling](#sensitive-data-handling)
2. [Input Validation & Sanitization](#input-validation--sanitization)
3. [XSS Prevention](#xss-prevention)
4. [CSRF Protection](#csrf-protection)
5. [Authentication & Authorization](#authentication--authorization)
6. [Content Security Policy](#content-security-policy)
7. [Environment Variables](#environment-variables)
8. [Dependencies & Vulnerabilities](#dependencies--vulnerabilities)
9. [Deployment Security](#deployment-security)
10. [Incident Response](#incident-response)

---

## Sensitive Data Handling

### API Keys & Credentials
- **NEVER** expose API keys in the client-side bundle
- Store all credentials in environment variables using `.env.local` (NOT committed to git)
- Use `process.env` only for non-sensitive configuration
- For sensitive operations (API key usage), implement backend proxy routes
- Regularly rotate API keys and credentials

### Data Classification
- **Critical**: User authentication tokens, API keys, database credentials
- **Confidential**: Security findings, vulnerability data, project metadata
- **Internal**: Security logs, audit trails
- **Public**: General product documentation

### Data Storage
- Use `sessionStorage` only for temporary, non-sensitive data
- Avoid `localStorage` for sensitive information
- Implement automatic session timeout after 30 minutes of inactivity
- Clear sensitive data from memory after use when possible

---

## Input Validation & Sanitization

### Validation Rules
All user inputs must be validated using the `validation.ts` utility:

```typescript
import { isValidEmail, isSafeInput, isValidUrl } from './utils/validation';

// ✅ CORRECT
if (isValidEmail(userEmail)) {
  processEmail(userEmail);
}

// ❌ WRONG
processEmail(userEmail); // No validation
```

### Sanitization
Use `sanitization.ts` utilities to prevent XSS:

```typescript
import { sanitizeHtml, sanitizeUrl, stripDangerousHtml } from './utils/sanitization';

// ✅ CORRECT - Display user input safely
const safeInput = sanitizeHtml(userProvidedString);
return <div>{safeInput}</div>;

// ❌ WRONG - Direct rendering of user input
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
```

### Validation Functions
- `isValidEmail()` - Validate email addresses
- `isValidUrl()` - Validate HTTP(S) URLs
- `isSafeInput()` - Check for malicious patterns
- `isValidAlphanumeric()` - Validate text-only input
- `isValidUuid()` - Validate UUIDs
- `hasRequiredProps()` - Validate object structure

---

## XSS Prevention

### Do's
✅ Use React's built-in XSS protection (text content escaping)
✅ Use `sanitizeHtml()` for user-generated content display
✅ Validate all external input sources
✅ Use `dangerouslySetInnerHTML` only with properly sanitized content
✅ Implement Content Security Policy headers

### Don'ts
❌ Never use `innerHTML` directly with user input
❌ Never use `eval()` or `Function()` constructor with user input
❌ Never render unescaped user input
❌ Never concatenate URLs from user input without validation

### Example
```typescript
// ❌ VULNERABLE
<div dangerouslySetInnerHTML={{ __html: findings.description }} />

// ✅ SECURE
import { sanitizeHtml } from './utils/sanitization';
<div>{sanitizeHtml(findings.description)}</div>
```

---

## CSRF Protection

### Implementation
- Use SameSite cookie attribute (configured at server level)
- Implement CSRF tokens for state-changing requests
- Validate origin headers on the backend
- Use POST requests for mutations, not GET

### API Calls
```typescript
// ✅ CORRECT - POST for state changes
const updateFinding = async (findingId: string, update: any) => {
  const response = await fetch(`/api/findings/${findingId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken() // Include CSRF token
    },
    body: JSON.stringify(update)
  });
};

// ❌ WRONG - GET for state changes
fetch(`/api/findings/${findingId}?update=${JSON.stringify(update)}`);
```

---

## Authentication & Authorization

### Requirements
- Implement multi-factor authentication (MFA) for user accounts
- Enforce strong password policies (minimum 12 characters, complexity requirements)
- Implement proper JWT token expiration (recommended: 15 minutes access token, 7 days refresh)
- Log all authentication events
- Implement account lockout after 5 failed login attempts

### Authorization Checks
```typescript
// ✅ CORRECT - Validate user permission
if (hasPermission(currentUser, 'view_findings', project)) {
  displayFindings(project);
}

// ❌ WRONG - No authorization check
displayFindings(project); // Anyone can view
```

---

## Content Security Policy

### Current CSP Header
```
default-src 'self';
script-src 'self' https://cdn.tailwindcss.com;
style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
object-src 'none';
upgrade-insecure-requests
```

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), xr-spatial-tracking=()
```

---

## Environment Variables

### Safe Configuration
```env
# ❌ NEVER include sensitive keys in .env
GEMINI_API_KEY=sk-xxxxxxxxxxxx

# ✅ Use only for non-sensitive config
VITE_APP_NAME=ANCHOR Security Dashboard
VITE_API_URL=https://api.anchor.dev
VITE_LOG_LEVEL=info
```

### Vite Configuration
- Only expose non-sensitive variables using `define`
- Never expose API keys in production builds
- Disable source maps in production
- Strip sensitive headers from build output

---

## Dependencies & Vulnerabilities

### Security Scanning
Run regular dependency vulnerability checks:
```bash
npm audit
npm audit fix
npm outdated
```

### Dependency Management
- Only use well-maintained, reputable packages
- Regularly update dependencies to patch versions
- Review security advisories before updating major versions
- Restrict npm package scope to prevent typosquatting

### Current Dependencies
- `react@^19.2.4` - Framework
- `react-dom@^19.2.4` - DOM rendering
- Review any new dependencies for security implications

---

## Deployment Security

### Build Process
```bash
# Production build with security optimizations
npm run build
```

### Deployment Checklist
- [ ] Run `npm audit` - Zero vulnerabilities required
- [ ] Enable HTTPS/TLS with valid certificates
- [ ] Configure HSTS header (min 31536000 seconds)
- [ ] Enable security headers on web server
- [ ] Disable debug mode and source maps
- [ ] Remove `.env.local` from deployment
- [ ] Implement rate limiting on server
- [ ] Enable logging and monitoring
- [ ] Set up WAF (Web Application Firewall)
- [ ] Regularly patch OS and infrastructure

### Production Security Headers
Configure on web server:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
```

---

## Incident Response

### Security Vulnerability Report
If you discover a security vulnerability:

1. **DO NOT** publicly disclose the vulnerability
2. Contact the security team immediately
3. Provide detailed reproduction steps
4. Document the impact and severity
5. Wait for confirmation before discussing with others

### Incident Severity Levels
- **Critical**: Immediate unauthorized access or data breach
- **High**: Significant security impact affecting many users
- **Medium**: Important security issue with limited impact
- **Low**: Minor security concern with minimal risk

### Response Timeline
- **Critical**: Fix within 24 hours
- **High**: Fix within 1 week
- **Medium**: Fix within 2 weeks
- **Low**: Fix in next release

---

## Security Best Practices Checklist

- [ ] Always validate and sanitize user input
- [ ] Never hardcode sensitive information
- [ ] Use HTTPS for all communications
- [ ] Implement proper error handling without exposing details
- [ ] Log security-relevant events
- [ ] Keep dependencies up to date
- [ ] Review code changes for security implications
- [ ] Test with security tools (OWASP ZAP, etc.)
- [ ] Implement rate limiting on backend
- [ ] Use environment variables for configuration
- [ ] Implement proper access controls
- [ ] Regularly conduct security audits

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## Questions?
Contact the security team or create an issue with security label for clarification.

**Last Updated**: January 28, 2026
**Version**: 1.0
