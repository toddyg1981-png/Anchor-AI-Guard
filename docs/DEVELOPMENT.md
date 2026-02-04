# 💻 Development Guide

Comprehensive guide for developers working on Anchor Security Dashboard.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style & Standards](#code-style--standards)
- [Testing](#testing)
- [API Integration](#api-integration)
- [Contributing](#contributing)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- VS Code (recommended)

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/anchor-security-dashboard.git
cd anchor-security-dashboard

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local

# 4. Add your Gemini API key to .env.local
echo "GEMINI_API_KEY=your_key_here" >> .env.local

# 5. Start development server
npm run dev
```

Application will be available at: http://localhost:3000

### VS Code Extensions (Recommended)

- ESLint
- Prettier - Code formatter
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitLens

## Project Structure

```
anchor-security-dashboard/
├── components/           # React components
│   ├── ErrorBoundary.tsx
│   ├── DashboardLayout.tsx
│   ├── LandingPage.tsx
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useAIAnalysis.ts
│   ├── useSecurityHooks.ts
│   └── ...
├── utils/               # Utility functions
│   ├── aiService.ts
│   ├── apiClient.ts
│   ├── errorHandler.ts
│   ├── logger.ts
│   └── ...
├── config/              # Configuration files
│   └── env.ts
├── tests/               # Test files
│   ├── setup.ts
│   ├── App.test.tsx
│   └── ...
├── .github/             # GitHub workflows
│   └── workflows/
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
├── types.ts             # TypeScript type definitions
├── constants.ts         # Application constants
└── ...config files
```

### Key Files

- **[App.tsx](App.tsx)** - Main application component with routing
- **[types.ts](types.ts)** - TypeScript interfaces and types
- **[constants.ts](constants.ts)** - Mock data and constants
- **[vite.config.ts](vite.config.ts)** - Vite configuration
- **[tsconfig.json](tsconfig.json)** - TypeScript configuration

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Start development server
npm run dev

# 4. Make changes and test
# ...

# 5. Run quality checks
npm run validate

# 6. Commit changes
git add .
git commit -m "feat: add new feature"

# 7. Push to remote
git push origin feature/your-feature-name

# 8. Create pull request on GitHub
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run preview          # Preview production build

# Building
npm run build            # Build for production
npm run build:staging    # Build for staging
npm run build:production # Build for production (optimized)

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Run TypeScript compiler check

# Testing
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:ui          # Open Vitest UI

# Validation
npm run validate         # Run all checks (lint + type-check + test)

# Utilities
npm run clean            # Clean build artifacts
```

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes to:
- `.tsx` files → Instant component refresh
- `.ts` files → Instant module reload
- `.css` files → Instant style injection

## Code Style & Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Explicit types, clear naming
interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  timestamp: Date;
}

function analyzeFinding(finding: SecurityFinding): AnalysisResult {
  // Implementation
}

// ❌ Avoid: Implicit any, unclear naming
function doStuff(data) {
  // ...
}
```

### Component Guidelines

```typescript
// ✅ Good: Functional component with proper typing
interface DashboardProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  onProjectSelect 
}) => {
  // Component implementation
};

// ✅ Good: Custom hooks for logic
function useProjectData() {
  const [projects, setProjects] = useState<Project[]>([]);
  // Hook logic
  return { projects, setProjects };
}
```

### File Naming Conventions

- **Components**: PascalCase - `DashboardLayout.tsx`
- **Hooks**: camelCase with 'use' prefix - `useAIAnalysis.ts`
- **Utils**: camelCase - `apiClient.ts`
- **Types**: PascalCase - `types.ts`
- **Tests**: Match source file - `Dashboard.test.tsx`

### Import Order

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';

// 2. Internal modules
import { errorHandler } from '@utils/errorHandler';
import { logger } from '@utils/logger';

// 3. Components
import Dashboard from '@components/Dashboard';

// 4. Types
import type { Project, Finding } from './types';

// 5. Styles/Assets
import './styles.css';
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new security analysis feature
fix: resolve API timeout issue
docs: update deployment guide
style: format code with prettier
refactor: simplify error handling logic
test: add tests for API client
chore: update dependencies
```

## Testing

### Writing Tests

```typescript
// tests/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Testing Best Practices

- **Unit Tests**: Test individual functions/components
- **Integration Tests**: Test component interactions
- **Coverage Target**: Aim for > 80%
- **Test Behavior**: Test what users see/do, not implementation
- **Mock External Calls**: Use mocks for API calls

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (recommended during development)
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode (interactive)
npm run test:ui
```

## API Integration

### Using API Client

```typescript
import { apiClient } from '@utils/apiClient';

// GET request with caching
const data = await apiClient.get<Project[]>('/api/projects');

// POST request
const result = await apiClient.post<CreateResponse>(
  '/api/projects',
  { name: 'New Project' }
);

// With custom configuration
const data = await apiClient.get<Analysis>('/api/analyze', {
  timeout: 60000,
  retries: 5,
  cache: true,
  cacheDuration: 300000, // 5 minutes
});
```

### Error Handling

```typescript
import { errorHandler, APIError } from '@utils/errorHandler';

try {
  const data = await apiClient.get('/api/data');
} catch (error) {
  if (error instanceof APIError) {
    // Handle API-specific errors
    errorHandler.handle(error);
  } else {
    // Handle other errors
    errorHandler.handle(new Error('Unknown error'));
  }
}
```

### Logging

```typescript
import { logger } from '@utils/logger';

// Different log levels
logger.debug('Debug information', { userId: 123 });
logger.info('User logged in');
logger.warn('API rate limit approaching');
logger.error('Failed to save data', { error: err });

// Performance timing
const endTimer = logger.time('Data processing');
// ... do work ...
endTimer(); // Logs duration
```

## Environment Variables

### Development

Edit [.env.local](.env.local):

```env
GEMINI_API_KEY=your_dev_key
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_USE_MOCK_DATA=true
```

### Accessing in Code

```typescript
import { env } from '@config/env';

if (env.debugMode) {
  console.log('Debug info');
}

if (env.enableAIAnalysis) {
  // Use AI features
}
```

## Debugging

### VS Code Debugging

Create [.vscode/launch.json](.vscode/launch.json):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

### Browser DevTools

- **React DevTools**: Inspect component tree
- **Network Tab**: Monitor API calls
- **Performance Tab**: Analyze performance
- **Console**: View logs and errors

## Contributing

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Run Validation**
   ```bash
   npm run validate
   ```

4. **Commit Changes**
   ```bash
   git commit -m "feat: add my feature"
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/my-feature
   ```

6. **Create Pull Request**
   - Add description
   - Link related issues
   - Request reviews

7. **Address Review Feedback**
   - Make requested changes
   - Push updates

8. **Merge**
   - Squash and merge
   - Delete feature branch

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log statements (use logger)
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] Performance considered
- [ ] Accessibility checked

## Performance Optimization

### Best Practices

```typescript
// ✅ Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// ✅ Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveOperation(data);
}, [data]);

// ✅ Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);

// ✅ Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Monitoring Performance

```typescript
import { performanceMonitor } from '@utils/performanceMonitor';

// Mark timing
performanceMonitor.mark('operation-start');
// ... do work ...
performanceMonitor.mark('operation-end');

// Measure duration
performanceMonitor.measure('operation', 'operation-start', 'operation-end');
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

#### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Type Errors

```bash
# Rebuild TypeScript
npm run type-check

# If using VS Code, reload window
Cmd/Ctrl + Shift + P → "Reload Window"
```

## Resources

- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Vite Guide**: https://vitejs.dev/guide
- **Vitest Documentation**: https://vitest.dev
- **Testing Library**: https://testing-library.com

---

Happy coding! 🚀

For questions, open an issue on GitHub or contact the team.
