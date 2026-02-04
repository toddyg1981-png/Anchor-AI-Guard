# ANCHOR Security Dashboard - Security Implementation Guide

## 🔒 Security Hardening Complete

This document provides an overview of all security implementations and how to use them.

---

## 📋 What's New

### Security Utilities (`utils/` directory)

#### 1. **Sanitization** (`utils/sanitization.ts`)
Prevent XSS attacks by safely handling user input:

```typescript
import { sanitizeHtml, sanitizeUrl, stripDangerousHtml } from './utils/sanitization';

// Safely display user-provided content
const safeDescription = sanitizeHtml(finding.description);

// Validate URLs before using them
const safeUrl = sanitizeUrl(userProvidedUrl);

// Remove dangerous HTML tags
const cleanHtml = stripDangerousHtml(htmlContent);
```

**Available Functions:**
- `sanitizeHtml()` - Escape HTML special characters
- `sanitizeUrl()` - Validate and sanitize URLs
- `sanitizeAttribute()` - Escape attribute values
- `stripDangerousHtml()` - Remove script tags and dangerous attributes
- `safeJsonParse()` - Safely parse JSON

---

#### 2. **Validation** (`utils/validation.ts`)
Validate user input before processing:

```typescript
import { 
  isValidEmail, 
  isValidUrl, 
  isSafeInput,
  isValidAlphanumeric 
} from './utils/validation';

// Validate emails
if (isValidEmail(userEmail)) {
  // Process email
}

// Check for malicious patterns
if (isSafeInput(userInput, 1000)) {
  // Process input (max 1000 chars)
}

// Validate URLs
if (isValidUrl(link)) {
  // Use URL
}

// Text-only validation
if (isValidAlphanumeric(projectName, 100)) {
  // Process project name
}
```

**Available Functions:**
- `isValidEmail()` - Validate email format
- `isValidUrl()` - Validate HTTP(S) URLs
- `isSafeInput()` - Detect malicious patterns
- `isValidAlphanumeric()` - Text and numbers only
- `isValidUuid()` - Validate UUID format
- `isValidNumber()` - Range validation
- `isValidString()` - Length validation
- `hasRequiredProps()` - Object structure validation

---

#### 3. **Rate Limiting** (`utils/rateLimiting.ts`)
Protect against abuse and DoS attacks:

```typescript
import { RateLimiter, debounce, throttle, retryWithBackoff } from './utils/rateLimiting';

// Rate limiter (100 requests per minute)
const limiter = new RateLimiter(100, 60000);

if (limiter.isAllowed('user123')) {
  // Process request
  const remaining = limiter.getRemaining('user123');
}

// Debounce search input (wait 500ms after typing stops)
const debouncedSearch = debounce((query) => {
  searchFindings(query);
}, 500);

// Throttle scroll events (max once per 250ms)
const throttledScroll = throttle((event) => {
  updateScrollPosition(event);
}, 250);

// Retry with exponential backoff
try {
  const data = await retryWithBackoff(
    () => fetchData(),
    3,  // max retries
    1000  // initial delay
  );
} catch (error) {
  console.error('Failed after retries:', error);
}
```

**Available Functions:**
- `RateLimiter` - In-memory rate limiting
- `debounce()` - Delay execution until after inactivity
- `throttle()` - Limit execution frequency
- `retryWithBackoff()` - Resilient retry logic

---

## 🔐 Security Features Implemented

### 1. Content Security Policy (CSP)
Prevents inline script injection and restricts resource loading:

```
default-src 'self';
script-src 'self' https://cdn.tailwindcss.com;
style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
img-src 'self' data: https:;
connect-src 'self';
frame-ancestors 'none';
object-src 'none';
```

### 2. Security Headers
All configured in `index.html`:
- ✅ `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- ✅ `X-Frame-Options: DENY` - Prevent clickjacking
- ✅ `X-XSS-Protection: 1; mode=block` - Enable XSS filter
- ✅ `Referrer-Policy: strict-origin-when-cross-origin` - Control referrer
- ✅ `Permissions-Policy` - Restrict browser features

### 3. Secure Configuration
- API keys protected (not in bundle)
- Development server bound to localhost only
- Source maps disabled in production
- TypeScript strict mode recommended

---

## 📖 Documentation

### [SECURITY.md](./SECURITY.md)
Comprehensive security guidelines for developers:
- Sensitive data handling
- Input validation & sanitization requirements
- XSS prevention best practices
- CSRF protection implementation
- Authentication & authorization requirements
- Deployment security checklist
- Incident response procedures

### [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
Detailed security audit report:
- Vulnerabilities identified and fixed
- Security features implemented
- Testing recommendations
- Deployment checklist
- Security metrics and score

---

## 🚀 Quick Start: Using Security Utilities

### Displaying User Content (XSS Prevention)

**❌ WRONG:**
```typescript
// Direct rendering - VULNERABLE to XSS
<div dangerouslySetInnerHTML={{ __html: finding.description }} />
```

**✅ CORRECT:**
```typescript
import { sanitizeHtml } from './utils/sanitization';

// Safe rendering
<div>{sanitizeHtml(finding.description)}</div>
```

---

### Validating User Input (Injection Prevention)

**❌ WRONG:**
```typescript
// No validation - vulnerable to injection
const sendData = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`);
};
```

**✅ CORRECT:**
```typescript
import { isValidUuid } from './utils/validation';

// With validation
const sendData = async (userId: string) => {
  if (!isValidUuid(userId)) {
    throw new Error('Invalid user ID');
  }
  const response = await fetch(`/api/users/${userId}`);
};
```

---

### Handling API Calls (Rate Limiting)

**Without Protection:**
```typescript
const searchFindings = (query: string) => {
  // Called on every keystroke - could flood server
  fetchFindings(query);
};
```

**With Rate Limiting:**
```typescript
import { debounce } from './utils/rateLimiting';

const searchFindings = debounce((query: string) => {
  // Only called 500ms after typing stops
  fetchFindings(query);
}, 500);
```

---

## 🔍 Security Checklist for Developers

Before committing code:

- [ ] Used `sanitizeHtml()` for displaying user content
- [ ] Validated all user input using validation utilities
- [ ] Checked for XSS vulnerabilities in templates
- [ ] Used HTTPS for all external API calls
- [ ] Never hardcoded API keys or secrets
- [ ] Implemented rate limiting on user actions
- [ ] Added proper error handling without sensitive info leaks
- [ ] Ran `npm audit` and fixed vulnerabilities
- [ ] Reviewed dependencies for security issues

---

## 🛠️ Development Commands

```bash
# Check for vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Build for production (with security optimizations)
npm run build

# Run development server (localhost only)
npm run dev
```

---

## 📊 Security Metrics

| Aspect | Status | Notes |
|--------|--------|-------|
| XSS Prevention | ✅ Implemented | Sanitization utilities available |
| Input Validation | ✅ Framework | Comprehensive validation functions |
| Rate Limiting | ✅ Available | Client-side throttling/debouncing |
| Security Headers | ✅ Configured | CSP and security headers in place |
| API Key Protection | ✅ Secured | Not exposed in bundle |
| Documentation | ✅ Complete | SECURITY.md and audit report |

---

## 🚨 Common Security Issues Fixed

### Issue 1: Missing Security Headers
**Before**: No CSP or security headers  
**After**: ✅ Comprehensive CSP and 6 security headers

### Issue 2: Insecure Server Config
**Before**: Server exposed to all network interfaces (0.0.0.0)  
**After**: ✅ Bound to localhost only (127.0.0.1)

### Issue 3: API Key Exposure
**Before**: API keys in production bundle  
**After**: ✅ Protected with environment-based loading

### Issue 4: No Input Sanitization
**Before**: User input displayed directly  
**After**: ✅ Sanitization utilities available

### Issue 5: No Input Validation
**Before**: All input trusted  
**After**: ✅ Comprehensive validation framework

---

## 📝 Next Steps

### For Developers
1. Review [SECURITY.md](./SECURITY.md) for guidelines
2. Use sanitization/validation utilities in all components
3. Run `npm audit` before each commit
4. Test for XSS vulnerabilities

### For DevOps/Deployment
1. Review [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) deployment checklist
2. Configure backend authentication system
3. Implement HTTPS/TLS
4. Set up logging and monitoring
5. Configure Web Application Firewall

### For Security Team
1. Schedule quarterly security audits
2. Monitor dependency vulnerabilities
3. Review logs for suspicious activity
4. Conduct penetration testing
5. Update security policies as needed

---

## 📞 Support

For security questions or concerns:
1. Check [SECURITY.md](./SECURITY.md) for guidelines
2. Review [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for detailed information
3. Contact the security team
4. Create an issue with the `security` label

---

**Last Updated**: January 28, 2026  
**Security Status**: ✅ Hardened & Ready for Deployment  
**Next Audit**: April 28, 2026
