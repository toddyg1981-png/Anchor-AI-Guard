# 🚀 Production Deployment Guide

Complete guide for deploying Anchor Security Dashboard to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Methods](#deployment-methods)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Required

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git** (for version control)

### Optional

- **Docker** (for containerized deployment)
- **GitHub Account** (for CI/CD)

### API Keys

- **Gemini API Key** - Required for AI analysis features
  - Get from: https://makersuite.google.com/app/apikey
  - Store securely (never commit to repository)

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/anchor-security-dashboard.git
cd anchor-security-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.production

# Edit .env.production with your values
nano .env.production
```

**Required Variables:**

```env
GEMINI_API_KEY=your_actual_gemini_api_key
VITE_APP_ENV=production
VITE_USE_MOCK_DATA=false
VITE_ENABLE_CSP=true
```

### 4. Build Application

```bash
# Production build
npm run build:production

# Verify build output
ls -lh dist/
```

Expected output size: ~300KB (gzipped)

## Deployment Methods

### Method 1: Vercel (Recommended for SPA)

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/anchor-security-dashboard)

#### Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add GEMINI_API_KEY production
vercel env add VITE_APP_ENV production
```

**Vercel Configuration** (`vercel.json`):

```json
{
  "buildCommand": "npm run build:production",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Method 2: Netlify

#### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

#### Manual Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build:production

# Deploy
netlify deploy --prod --dir=dist

# Set environment variables in Netlify UI
# Settings > Build & Deploy > Environment
```

**Netlify Configuration** (`netlify.toml`):

```toml
[build]
  command = "npm run build:production"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "no-referrer-when-downgrade"
```

### Method 3: Docker

#### Build Image

```bash
# Build Docker image
docker build -t anchor-security-dashboard:latest .

# Run container
docker run -d \
  -p 80:80 \
  --name anchor-app \
  --restart unless-stopped \
  anchor-security-dashboard:latest
```

#### Docker Compose

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f anchor-app

# Stop services
docker-compose down
```

### Method 4: Traditional Server (Nginx)

#### 1. Build Application

```bash
npm run build:production
```

#### 2. Upload to Server

```bash
# Using SCP
scp -r dist/* user@your-server:/var/www/anchor

# Or using rsync
rsync -avz dist/ user@your-server:/var/www/anchor/
```

#### 3. Configure Nginx

```nginx
server {
    listen 80;
    server_name anchor-security.your-domain.com;
    root /var/www/anchor;
    index index.html;

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 4. Setup SSL with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d anchor-security.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Method 5: AWS S3 + CloudFront

#### 1. Build Application

```bash
npm run build:production
```

#### 2. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://anchor-security-dashboard

# Configure for static website
aws s3 website s3://anchor-security-dashboard \
  --index-document index.html \
  --error-document index.html
```

#### 3. Upload Files

```bash
# Sync dist folder
aws s3 sync dist/ s3://anchor-security-dashboard \
  --delete \
  --cache-control "max-age=31536000"

# Update index.html with shorter cache
aws s3 cp dist/index.html s3://anchor-security-dashboard/index.html \
  --cache-control "max-age=300"
```

#### 4. Setup CloudFront

```bash
# Create distribution (use AWS Console or CLI)
# Configure:
# - Origin: S3 bucket
# - Viewer Protocol: Redirect HTTP to HTTPS
# - Compress Objects: Yes
# - Custom Error Response: 404 -> /index.html (200)
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check if site is accessible
curl -I https://your-domain.com

# Test specific routes
curl https://your-domain.com/dashboard
curl https://your-domain.com/projects
```

### 2. Configure DNS

Point your domain to the deployment:

- **Vercel/Netlify**: Add domain in dashboard
- **Traditional Server**: Create A record pointing to server IP
- **CloudFront**: Create CNAME record pointing to CloudFront distribution

### 3. Enable HTTPS

- **Vercel/Netlify**: Automatic
- **Traditional Server**: Use Let's Encrypt (see above)
- **CloudFront**: Use AWS Certificate Manager

### 4. Setup Monitoring

#### Integrate Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/react

# Configure in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

#### Google Analytics

Add to [index.html](index.html):

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 5. Configure CDN

For optimal performance:

- Enable compression (Gzip/Brotli)
- Configure caching headers
- Use CDN for static assets
- Enable HTTP/2

## Monitoring & Maintenance

### Health Checks

```bash
# Check application health
curl https://your-domain.com/health

# Monitor uptime
# Use services like:
# - UptimeRobot
# - Pingdom
# - StatusCake
```

### Performance Monitoring

- **Lighthouse CI**: Run performance audits on each deployment
- **WebPageTest**: Test from multiple locations
- **Chrome DevTools**: Monitor Core Web Vitals

### Log Monitoring

```bash
# Docker logs
docker logs -f anchor-app

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Backup Strategy

```bash
# Backup database (if applicable)
# Backup configuration files
# Store environment variables securely
```

### Update Process

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build
npm run build:production

# Test
npm test

# Deploy
# (use appropriate method from above)
```

## Troubleshooting

### Common Issues

#### 1. Blank Page After Deployment

- Check browser console for errors
- Verify `base` URL in [vite.config.ts](vite.config.ts)
- Ensure SPA routing is configured

#### 2. Environment Variables Not Working

- Verify variables start with `VITE_`
- Check build logs
- Confirm variables are set in deployment platform

#### 3. API Calls Failing

- Check CORS configuration
- Verify API endpoints
- Check network tab in browser DevTools

#### 4. Performance Issues

- Enable compression
- Optimize images
- Enable caching
- Use CDN

### Support

For deployment assistance:

- **Documentation**: Check [README.md](README.md)
- **Issues**: GitHub Issues
- **Community**: Discord/Slack

## Security Checklist

- [ ] Environment variables secured (not in code)
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Content Security Policy active
- [ ] Rate limiting implemented
- [ ] Error messages don't expose sensitive info
- [ ] Dependencies up to date
- [ ] Security audit passed (`npm audit`)

## Performance Checklist

- [ ] Build size < 500KB (gzipped)
- [ ] Lighthouse score > 90
- [ ] Time to Interactive < 3s
- [ ] First Contentful Paint < 1.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Compression enabled
- [ ] Caching configured
- [ ] Images optimized

---

## 🎉 Deployment Complete!

Your Anchor Security Dashboard is now live and ready for use.

**Next Steps:**
1. Monitor application performance
2. Set up alerts for errors
3. Configure automated backups
4. Plan for scaling
5. Document custom configurations

For questions or issues, please open a GitHub issue or contact support.
