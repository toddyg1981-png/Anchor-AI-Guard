# 🚀 Getting Started with Production Build

## Welcome! Your application is now production-ready.

This guide will walk you through the essential steps to get your Anchor Security Dashboard up and running.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- ✅ **npm** 9.0.0 or higher (comes with Node.js)
- ✅ **Git** for version control
- ✅ **Gemini API Key** ([Get one free](https://makersuite.google.com/app/apikey))

### Check Your Environment

```powershell
# Check Node.js version
node --version  # Should be v18.0.0 or higher

# Check npm version
npm --version   # Should be 9.0.0 or higher

# Check Git
git --version
```

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```powershell
npm install
```

This will install all required packages (~300MB).

### Step 2: Configure Environment

```powershell
# Your .env.local file already exists
# Just add your Gemini API key:

# Open .env.local in your editor
notepad .env.local

# Add this line:
GEMINI_API_KEY=your_actual_api_key_here
```

**Get your API key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)

### Step 3: Start Development Server

```powershell
npm run dev
```

✅ **Open your browser**: [http://localhost:3000](http://localhost:3000)

🎉 **You're running!** The dashboard should now be visible.

---

## 🧪 Verify Everything Works

### Run All Quality Checks

```powershell
npm run validate
```

This will:
- ✅ Check code formatting
- ✅ Run linting
- ✅ Type check TypeScript
- ✅ Run all tests

Expected output: All checks should pass ✅

### Build for Production

```powershell
npm run build:production
```

This creates an optimized production build in the `dist/` folder.

### Preview Production Build

```powershell
npm run preview
```

View at: [http://localhost:4173](http://localhost:4173)

---

## 📚 Key Files to Know

### Configuration
- **[.env.local](.env.local)** - Your local environment variables (keep secret!)
- **[package.json](package.json)** - Project dependencies and scripts
- **[vite.config.ts](vite.config.ts)** - Build configuration

### Source Code
- **[App.tsx](App.tsx)** - Main application component
- **[index.tsx](index.tsx)** - Application entry point
- **[components/](components/)** - React components
- **[utils/](utils/)** - Utility functions
- **[hooks/](hooks/)** - Custom React hooks

### Documentation
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete feature list
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment guide
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development guide
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

---

## 🛠️ Available Commands

### Development
```powershell
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run preview          # Preview production build
npm run clean            # Clean build artifacts
```

### Code Quality
```powershell
npm run lint             # Check for code issues
npm run lint:fix         # Fix code issues automatically
npm run format           # Format all code
npm run format:check     # Check code formatting
npm run type-check       # Check TypeScript types
npm run validate         # Run ALL checks
```

### Testing
```powershell
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:ui          # Open test UI interface
```

### Build Scripts
```powershell
npm run build:staging    # Build for staging
npm run build:production # Build for production

# Or use the comprehensive build script:
.\scripts\build-production.ps1  # Windows
# or
./scripts/build-production.sh   # Mac/Linux
```

---

## 🚀 Ready to Deploy?

### Option 1: Vercel (Easiest - Recommended)

1. **Install Vercel CLI**:
   ```powershell
   npm install -g vercel
   ```

2. **Deploy**:
   ```powershell
   vercel
   ```

3. **Add Environment Variables** in Vercel dashboard:
   - `GEMINI_API_KEY` = your_api_key
   - `VITE_APP_ENV` = production

### Option 2: Netlify

1. **Install Netlify CLI**:
   ```powershell
   npm install -g netlify-cli
   ```

2. **Build and Deploy**:
   ```powershell
   npm run build:production
   netlify deploy --prod --dir=dist
   ```

### Option 3: Docker

```powershell
# Build and run
docker-compose up -d

# Access at http://localhost
```

### Option 4: Traditional Hosting

```powershell
# Build
npm run build:production

# Upload contents of dist/ folder to your web server
```

📖 **Full deployment guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 🔧 Development Workflow

### Daily Development

```powershell
# 1. Start development server
npm run dev

# 2. Make your changes
# Edit files in components/, utils/, etc.

# 3. Tests auto-run (if in watch mode)
npm run test:watch

# 4. Before committing
npm run validate

# 5. Commit your changes
git add .
git commit -m "feat: your feature description"
git push
```

### Making Changes

1. **Edit a Component**: Modify files in `components/`
2. **Add a Feature**: Create new files as needed
3. **Update Styling**: Edit Tailwind classes directly in components
4. **Add Tests**: Create matching `.test.tsx` files in `tests/`

---

## 📊 Project Structure

```
anchor-security-dashboard/
├── components/          # UI Components
│   ├── DashboardLayout.tsx
│   ├── ErrorBoundary.tsx
│   └── ...
├── hooks/              # Custom React Hooks
│   ├── useAIAnalysis.ts
│   └── useSecurityHooks.ts
├── utils/              # Utilities
│   ├── aiService.ts
│   ├── apiClient.ts
│   ├── errorHandler.ts
│   ├── logger.ts
│   └── performanceMonitor.ts
├── config/             # Configuration
│   └── env.ts
├── tests/              # Test Files
├── docs/               # Documentation
├── .github/            # CI/CD Workflows
└── scripts/            # Build Scripts
```

---

## 🆘 Troubleshooting

### Port 3000 Already in Use

```powershell
# Option 1: Kill the process
npx kill-port 3000

# Option 2: Use different port
npm run dev -- --port 3001
```

### Module Not Found Errors

```powershell
# Clear and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Build Errors

```powershell
# Clean and rebuild
npm run clean
npm run build
```

### Environment Variables Not Loading

1. Ensure `.env.local` exists
2. Verify variables start with `VITE_` (except GEMINI_API_KEY)
3. Restart dev server after changing environment variables

---

## 📖 Learn More

### Essential Reading

1. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**
   - Complete list of everything that's been built
   - Feature descriptions
   - Architecture overview

2. **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)**
   - Detailed development guide
   - Coding standards
   - Best practices

3. **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**
   - Complete deployment instructions
   - Multiple hosting options
   - SSL setup
   - Monitoring configuration

4. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**
   - Pre-deployment checklist
   - Post-deployment verification
   - Maintenance tasks

### Technology Stack

- **React 19.2** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 6.2** - Build tool
- **Vitest** - Testing framework
- **Google Gemini 2.0** - AI analysis

---

## ✅ Your Next Steps

1. **✅ Verify Installation**
   ```powershell
   npm run validate
   ```

2. **✅ Start Development**
   ```powershell
   npm run dev
   ```

3. **✅ Make Your First Change**
   - Edit `components/LandingPage.tsx`
   - See changes instantly

4. **✅ Run Tests**
   ```powershell
   npm test
   ```

5. **✅ Build for Production**
   ```powershell
   npm run build:production
   ```

6. **✅ Deploy** (when ready)
   - Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 💡 Pro Tips

### Speed Up Development

- **Use Watch Mode**: `npm run test:watch` - tests run automatically
- **Multiple Terminals**: Run dev server in one, tests in another
- **VS Code**: Install recommended extensions for better DX
- **Hot Reload**: Changes appear instantly in browser

### Code Quality

```powershell
# Before every commit
npm run validate

# Auto-fix formatting
npm run format

# Auto-fix linting
npm run lint:fix
```

### Debugging

- **Browser DevTools**: F12 in browser
- **React DevTools**: Install browser extension
- **Console Logs**: Use `logger.debug()` instead of `console.log()`
- **Performance**: Check Performance tab in DevTools

---

## 🎯 Goals Checklist

### Week 1: Setup & Familiarization
- [ ] Environment configured
- [ ] Development server running
- [ ] All tests passing
- [ ] First component modified

### Week 2: Development
- [ ] New feature added
- [ ] Tests written
- [ ] Code quality checks passing
- [ ] Documentation updated

### Week 3: Production Prep
- [ ] Production build successful
- [ ] Performance optimized
- [ ] Security audit passed
- [ ] Deployment method chosen

### Week 4: Launch
- [ ] Deployed to staging
- [ ] Testing complete
- [ ] Deployed to production
- [ ] Monitoring configured

---

## 📞 Need Help?

### Documentation
- **Development**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **Deployment**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Features**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

### Common Questions

**Q: How do I add a new page?**
A: Create a new component in `components/`, add routing in `App.tsx`

**Q: How do I call an API?**
A: Use `apiClient` from `utils/apiClient.ts` - includes retry logic and caching

**Q: How do I handle errors?**
A: Use `errorHandler` from `utils/errorHandler.ts` - centralized error management

**Q: How do I add logging?**
A: Use `logger` from `utils/logger.ts` - structured logging with levels

---

## 🎉 You're All Set!

Your Anchor Security Dashboard is **production-ready** and **fully equipped** with:

✅ Modern development environment
✅ Comprehensive testing
✅ Error handling & logging
✅ Performance monitoring
✅ CI/CD pipelines
✅ Docker support
✅ Complete documentation

**Start building amazing features! 🚀**

---

**Quick Reference:**
- Dev Server: `npm run dev` → http://localhost:3000
- Run Tests: `npm test`
- Build Prod: `npm run build:production`
- Validate All: `npm run validate`

Happy coding! 💻✨
