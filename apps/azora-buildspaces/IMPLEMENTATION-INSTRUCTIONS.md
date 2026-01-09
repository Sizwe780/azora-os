# 🤖 Implementation Instructions for Coding Agents

**Purpose**: Clear, actionable instructions for implementing all BuildSpaces production requirements  
**Date**: January 9, 2026  
**Status**: Ready for Implementation

---

## 📋 What This Repository Contains

This repository has **comprehensive documentation** for making BuildSpaces production-ready:

1. **README.md** - Overview of what BuildSpaces is and what's missing
2. **PRODUCTION-LAUNCH-CHECKLIST.md** - 110-item checklist organized by priority
3. **CODING-AGENT-IMPLEMENTATION-GUIDE.md** - Step-by-step technical implementation
4. **FULL-PRODUCTION-IMPLEMENTATION-PLAN.md** - 8-phase detailed plan with all requirements
5. **This File** - Quick start guide for agents

---

## 🎯 Your Mission

Transform BuildSpaces from 85% complete to **100% production-ready** by:

1. ✅ **Implementing all infrastructure** (Docker, tests, health checks, security)
2. 🔧 **Fixing all broken components** (Code Chamber, demos, links, buttons)
3. 💻 **Making Code Chamber = GitHub Codespaces** (full feature parity)
4. 🎮 **Building 7 fully functional demos** (interactive, sample data, no auth)
5. ⚖️ **Ensuring constitutional compliance** (no mock data, AI validation)
6. 🚀 **Deploying to production** (tested, monitored, operational)

---

## 🚀 Quick Start for Coding Agents

### Step 1: Read the Documentation (5 minutes)

**Required Reading Order**:
1. Read `README.md` - Understand what BuildSpaces does and what's missing
2. Skim `FULL-PRODUCTION-IMPLEMENTATION-PLAN.md` - See the big picture (8 phases)
3. Read `CODING-AGENT-IMPLEMENTATION-GUIDE.md` - Get technical details
4. Reference `PRODUCTION-LAUNCH-CHECKLIST.md` - Track your progress

### Step 2: Set Up Your Environment (10 minutes)

```bash
# Navigate to BuildSpaces
cd /home/runner/work/azora/azora/apps/azora-buildspaces

# Install dependencies (from repo root)
cd /home/runner/work/azora/azora
npm ci

# Create environment file
cd apps/azora-buildspaces
cp .env.example .env.local

# Edit .env.local with your values
# At minimum, set DATABASE_URL

# Generate Prisma client
npx prisma generate --schema=../../prisma/schema.prisma

# Run dev server to see current state
npm run dev
```

### Step 3: Start Implementing (Follow the Guide)

**Use this workflow**:

1. **Pick a task** from `CODING-AGENT-IMPLEMENTATION-GUIDE.md`
2. **Implement it** following the code examples provided
3. **Test it** locally
4. **Commit and push** your changes
5. **Update checklist** in `PRODUCTION-LAUNCH-CHECKLIST.md`
6. **Repeat** until all critical items done

---

## 📁 Where to Find What

### Documentation
- **What's Missing**: `README.md` section "What's Missing for Production"
- **What to Do**: `PRODUCTION-LAUNCH-CHECKLIST.md` 
- **How to Do It**: `CODING-AGENT-IMPLEMENTATION-GUIDE.md`
- **Full Plan**: `FULL-PRODUCTION-IMPLEMENTATION-PLAN.md`

### Code Locations
- **Components**: `apps/azora-buildspaces/components/`
- **Pages**: `apps/azora-buildspaces/app/`
- **API Routes**: `apps/azora-buildspaces/app/api/`
- **Services**: `apps/azora-buildspaces/lib/services/`
- **Tests**: `apps/azora-buildspaces/tests/`
- **K8s Manifests**: `apps/azora-buildspaces/k8s/`

### Key Files to Create
- `Dockerfile` - Container definition
- `jest.config.js` - Test configuration
- `app/api/health/route.ts` - Health check endpoint
- `lib/middleware/rate-limiter.ts` - Rate limiting
- `components/demo/*.tsx` - Demo components

### Key Files to Fix
- `components/rooms/code-chamber.tsx` - Make `id` prop optional
- `components/rooms/command-desk.tsx` - Remove mock data
- `components/rooms/knowledge-ocean.tsx` - Remove mock data
- `components/rooms/design-studio.tsx` - Remove fake Figma
- `components/rooms/ai-studio.tsx` - Remove INITIAL_CELLS
- `components/rooms/maker-lab/DatabaseDesigner.tsx` - Remove hardcoded schema

---

## 🎯 Implementation Priority

### Phase 1: Critical Infrastructure (DO FIRST)
**Estimated Time**: 2-3 days  
**Blocking**: Everything else depends on this

1. Create `Dockerfile` (see guide for template)
2. Create `jest.config.js` (see guide for template)
3. Create health check endpoint at `app/api/health/route.ts`
4. Add rate limiting to `lib/middleware/rate-limiter.ts`
5. Add security headers to `next.config.mjs`

**Why First**: Can't deploy without Docker, can't verify quality without tests

### Phase 2: Fix Broken Code (DO SECOND)
**Estimated Time**: 2-3 days  
**Blocking**: Can't test if components crash

1. Fix Code Chamber component (make `id` optional)
2. Create all demo components in `components/demo/`
3. Wire up all broken links and buttons
4. Test that nothing crashes

**Why Second**: Need working foundation before adding features

### Phase 3: Code Chamber Enhancements (DO THIRD)
**Estimated Time**: 5-6 days  
**Blocking**: Core product value

1. Add context menu to file explorer
2. Enhance Monaco editor with all features
3. Implement working terminal (WebContainer API)
4. Add Git integration (isomorphic-git)
5. Build command palette
6. Add keyboard shortcuts

**Why Third**: This is the main product, needs to be excellent

### Phase 4: Demos (DO FOURTH)
**Estimated Time**: 2-3 days  
**Blocking**: Lead generation

1. Create 7 demo pages with sample data
2. Make demos interactive and functional
3. Add upgrade prompts
4. Test all demos work without auth

**Why Fourth**: Reuse Code Chamber work, generates signups

### Phase 5: Constitutional & Testing (DO FIFTH)
**Estimated Time**: 3-4 days  
**Blocking**: Production readiness

1. Remove all remaining mock data
2. Write unit tests for all API routes
3. Write E2E tests for critical flows
4. Run load tests
5. Security audit

**Why Fifth**: Can't launch without quality and compliance

### Phase 6: Deploy (DO LAST)
**Estimated Time**: 1-2 days  
**Blocking**: Going live

1. Deploy to staging
2. Test everything in staging
3. Deploy to production
4. Monitor for issues

**Why Last**: Everything must work before going live

---

## 🔥 Most Critical Items (DO THESE FIRST)

If you can only do 10 things, do these:

1. ✅ Create Dockerfile
2. ✅ Create Jest config
3. ✅ Fix Code Chamber component (broken id prop)
4. ✅ Remove all mock data (Command Desk, Knowledge Ocean, etc.)
5. ✅ Create health check endpoint
6. ✅ Add rate limiting to expensive endpoints
7. ✅ Create 7 working demo components
8. ✅ Fix all broken navigation links
9. ✅ Write tests for all API routes
10. ✅ Deploy to production

---

## 📝 Code Examples

### Example 1: Fix Code Chamber
**Problem**: Component expects `id` prop but workspace doesn't pass it

**File**: `components/rooms/code-chamber.tsx`

```typescript
// BEFORE (broken)
interface CodeChamberProps {
    id: string  // Required, breaks when not passed
}

export function CodeChamber({ id }: CodeChamberProps) {
    const { loadProject } = useFileSystem()
    
    useEffect(() => {
        if (id) {
            loadProject(id)  // Crashes if id is undefined
        }
    }, [id])
    // ...
}

// AFTER (fixed)
interface CodeChamberProps {
    id?: string  // Make optional
}

export function CodeChamber({ id }: CodeChamberProps) {
    const { loadProject } = useFileSystem()
    const searchParams = useSearchParams()
    
    // Get ID from prop, URL, or use default
    const projectId = id || searchParams.get('project') || 'default-project'
    
    useEffect(() => {
        loadProject(projectId)  // Always has a value
    }, [projectId])
    // ...
}
```

### Example 2: Remove Mock Data
**Problem**: Component has hardcoded fake data

**File**: `components/rooms/command-desk.tsx`

```typescript
// BEFORE (violates No Mock Protocol)
const initialMessages = [
    { role: 'assistant', content: 'Hello! I am Elara...' },
    { role: 'user', content: 'Show me my tasks' },
    // ... more fake messages
]

export function CommandDesk() {
    const [messages, setMessages] = useState(initialMessages)  // WRONG
    // ...
}

// AFTER (constitutional compliance)
export function CommandDesk() {
    const [messages, setMessages] = useState<Message[]>([])  // Start empty
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        // Load real data from database
        async function loadMessages() {
            try {
                const response = await fetch('/api/chat/sessions/current/messages')
                const data = await response.json()
                setMessages(data.messages || [])
            } catch (error) {
                console.error('Failed to load messages:', error)
            } finally {
                setLoading(false)
            }
        }
        loadMessages()
    }, [])
    
    if (loading) {
        return <div>Loading messages...</div>
    }
    
    // Show empty state if no messages
    if (messages.length === 0) {
        return <EmptyState message="Start a conversation!" />
    }
    // ...
}
```

### Example 3: Create Demo Component
**Problem**: Demo page imports non-existent component

**File**: `components/demo/code-chamber-demo.tsx`

```typescript
'use client'

import { useState } from 'react'
import { WorkbenchLayout } from '@/components/workspace/layout/workbench-layout'
import { EditorPanel } from '@/components/workspace/editor-panel'
import { ExplorerView } from '@/components/workspace/views/explorer-view'
import { TerminalPanel } from '@/components/workspace/panels/terminal-panel'

// Sample project for demo
const DEMO_FILES = {
    'index.html': `<!DOCTYPE html>
<html>
<head>
    <title>Demo App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Hello BuildSpaces!</h1>
    <script src="script.js"></script>
</body>
</html>`,
    'styles.css': `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

h1 {
    text-align: center;
    font-size: 3rem;
}`,
    'script.js': `console.log('Welcome to BuildSpaces!');

// Try editing this file and run it!
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
});`
}

export function CodeChamber() {
    const [activeFile, setActiveFile] = useState('index.html')
    const [files] = useState(DEMO_FILES)
    
    return (
        <WorkbenchLayout
            sidebarContent={
                <div className="p-4">
                    <h3 className="text-sm font-semibold mb-2">Files</h3>
                    {Object.keys(files).map(filename => (
                        <button
                            key={filename}
                            onClick={() => setActiveFile(filename)}
                            className={`block w-full text-left px-2 py-1 text-sm rounded ${
                                activeFile === filename ? 'bg-emerald-500/20' : 'hover:bg-white/10'
                            }`}
                        >
                            {filename}
                        </button>
                    ))}
                </div>
            }
            editorContent={
                <EditorPanel
                    activeFile={activeFile}
                    openFiles={Object.keys(files)}
                    onFileSelect={setActiveFile}
                    onCloseFile={() => {}}
                />
            }
            panelContent={<TerminalPanel onClose={() => {}} />}
        />
    )
}
```

---

## ✅ Testing Your Work

### Before Every Commit
```bash
# Check TypeScript errors
npm run type-check

# Run linter
npm run lint

# Run tests
npm test

# Build to verify no build errors
npm run build
```

### After Major Changes
```bash
# Run full test suite
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Test in browser
npm run dev
# Visit http://localhost:3000
```

### Before Deployment
```bash
# Build Docker image
docker build -t buildspaces .

# Run container
docker run -p 3000:3000 buildspaces

# Test health check
curl http://localhost:3000/api/health
```

---

## 🆘 Troubleshooting

### Problem: "Cannot find module '@/components/demo/...'"
**Solution**: Create the demo component first before importing it

### Problem: "Prisma client not generated"
**Solution**: Run `npx prisma generate --schema=../../prisma/schema.prisma`

### Problem: "Docker build fails"
**Solution**: Check Node version matches between Dockerfile and package.json

### Problem: "Tests fail with import errors"
**Solution**: Check jest.config.js has correct moduleNameMapper paths

### Problem: "Type errors in components"
**Solution**: Make sure all props are properly typed and optional props marked with `?`

### Problem: "Component crashes on mount"
**Solution**: Check for missing null checks and optional chaining (`?.`)

---

## 📊 Progress Tracking

Use the checklist in `PRODUCTION-LAUNCH-CHECKLIST.md` to track progress:

```markdown
## Critical Items
- [x] Create Dockerfile
- [x] Create Jest config
- [ ] Fix Code Chamber
- [ ] Remove mock data
...
```

Update the checklist after completing each item.

---

## 🎓 Learning Resources

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### Monaco Editor
- [Monaco Editor Docs](https://microsoft.github.io/monaco-editor/)
- [Monaco in React](https://github.com/react-monaco-editor/react-monaco-editor)

### WebContainer
- [WebContainer API](https://webcontainer.io/)

### Prisma
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)

### Testing
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Playwright Docs](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 🤝 Getting Help

If you're stuck:

1. **Check the docs** - All guides have detailed examples
2. **Search the codebase** - Look for similar patterns
3. **Check existing tests** - See how others tested similar code
4. **Ask for help** - Create an issue or ask the team

---

## 🎯 Success Criteria

You're done when:

✅ All critical items in checklist completed  
✅ All tests passing  
✅ Code coverage > 80%  
✅ No mock data remaining  
✅ Docker builds successfully  
✅ All demos work without auth  
✅ All links and buttons functional  
✅ Code Chamber = Codespaces feature parity  
✅ Deployed to production  
✅ Health checks green  
✅ No errors in logs  

---

## 🎉 Final Notes

**Remember**:
- **Start small** - Don't try to do everything at once
- **Test frequently** - Catch issues early
- **Commit often** - Small, focused commits
- **Read the guides** - All the answers are documented
- **Ask questions** - Better to ask than assume

**You've got this!** 💪

The documentation is comprehensive. The plan is clear. The examples are provided. Now it's time to implement.

**Built with Ubuntu Philosophy** 💚  
*"I am because we are"*

---

**Last Updated**: January 9, 2026  
**Status**: Ready for Implementation  
**Estimated Completion**: 4 weeks
