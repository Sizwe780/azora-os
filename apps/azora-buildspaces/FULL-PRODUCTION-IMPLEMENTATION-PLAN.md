# 🚀 Full Production Implementation Plan

**Date**: January 9, 2026  
**Status**: COMPREHENSIVE IMPLEMENTATION REQUIRED  
**Priority**: 🔴 CRITICAL - Complete System Overhaul

---

## 📋 New Requirements Summary

Based on the latest requirements, we need to:

1. ✅ **Complete all identified gaps** (from previous analysis)
2. 🔧 **Fix all broken links and non-functional buttons**
3. 🎯 **Make demos fully functional** (like real rooms but with reduced features)
4. 💻 **Code Chamber = GitHub Codespaces** (full feature parity)
5. ⚖️ **Constitutional alignment** (verify compliance)
6. 🎉 **Production ready** (tested, deployed, operational)

---

## 🔴 PHASE 1: Critical Infrastructure (Days 1-3)

### 1.1 Dockerfile & Containerization
**Status**: ❌ MISSING  
**Files**:
- Create `apps/azora-buildspaces/Dockerfile`
- Create `apps/azora-buildspaces/.dockerignore`
- Update `next.config.mjs` to add `output: 'standalone'`

### 1.2 Jest Configuration
**Status**: ❌ MISSING  
**Files**:
- Create `apps/azora-buildspaces/jest.config.js`
- Create `apps/azora-buildspaces/jest.setup.js`
- Install test dependencies

### 1.3 Health Check Endpoint
**Status**: ❌ MISSING  
**Files**:
- Create `app/api/health/route.ts`
- Update K8s probes to use health endpoint

### 1.4 Rate Limiting
**Status**: ❌ MISSING  
**Files**:
- Create `lib/middleware/rate-limiter.ts`
- Apply to all expensive API routes:
  - `/api/buildspaces/execute`
  - `/api/agents/invoke`
  - `/api/design/generate`
  - `/api/chat/sessions`

### 1.5 Security Headers
**Status**: ❌ MISSING  
**Files**:
- Update `next.config.mjs` with security headers

---

## 🔧 PHASE 2: Fix Broken Components (Days 4-6)

### 2.1 Fix Code Chamber Component
**Current Issue**: Component expects `id` prop but workspace doesn't pass it

**Files to Fix**:
- `components/rooms/code-chamber.tsx` - Make `id` optional, load from URL/context
- `app/workspace/page.tsx` - Pass project ID properly

**Implementation**:
```typescript
// code-chamber.tsx - Make id optional
interface CodeChamberProps {
    id?: string  // Make optional
}

export function CodeChamber({ id }: CodeChamberProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const projectId = id || searchParams.get('project') || 'default-project'
    
    // ... rest of logic
}
```

### 2.2 Fix Demo Components
**Current Issue**: Demos reference `@/components/demo/code-chamber-demo` which doesn't exist

**Files to Create**:
- `components/demo/code-chamber-demo.tsx`
- `components/demo/spec-chamber-demo.tsx`
- `components/demo/design-studio-demo.tsx`
- `components/demo/ai-studio-demo.tsx`
- `components/demo/command-desk-demo.tsx`
- `components/demo/maker-lab-demo.tsx`
- `components/demo/knowledge-ocean-demo.tsx`

**Demo Strategy**: Each demo should:
- Use real UI components
- Have limited/simulated functionality
- Show "Upgrade to unlock" for premium features
- Pre-populate with sample data
- Not require authentication
- Be fully interactive but with constrained execution

### 2.3 Fix Broken Links
**Audit all internal links**:
```bash
# Find all Link components
grep -r "Link href=" --include="*.tsx" --include="*.ts"

# Find all navigation calls
grep -r "router.push\|navigate" --include="*.tsx" --include="*.ts"
```

**Common broken links to fix**:
- Dashboard links to workspace
- Auth callback URLs
- Feature pages to demo pages
- Navigation menu links
- Footer links

### 2.4 Fix Non-Functional Buttons
**Audit all buttons**:
```bash
# Find all Button components without onClick/href
grep -r "<Button" --include="*.tsx" | grep -v "onClick\|href"
```

**Buttons to wire up**:
- All "Get Started" buttons → `/auth/signup`
- All "Try Demo" buttons → respective `/demo-*` pages
- All "Learn More" buttons → respective feature pages
- All "Sign Up" buttons → `/auth/signup`
- All "Log In" buttons → `/auth/login`
- All action buttons in workspace → actual API calls

---

## 💻 PHASE 3: Code Chamber = GitHub Codespaces (Days 7-12)

### 3.1 Core Editor Features
**Target**: Match GitHub Codespaces functionality

#### File Explorer (✅ Exists, needs enhancement)
**Current**: `components/workspace/views/explorer-view.tsx`  
**Required Features**:
- [x] Tree view of files/folders
- [ ] Right-click context menu (new file, folder, delete, rename)
- [ ] Drag & drop file organization
- [ ] File icons by type
- [ ] Collapse/expand folders
- [ ] Search in file names

**Implementation**:
```typescript
// Add context menu to explorer-view.tsx
const FileContextMenu = ({ file, onAction }) => (
  <ContextMenu>
    <ContextMenuItem onClick={() => onAction('rename', file)}>
      <Pencil className="w-4 h-4 mr-2" />
      Rename
    </ContextMenuItem>
    <ContextMenuItem onClick={() => onAction('delete', file)}>
      <Trash className="w-4 h-4 mr-2" />
      Delete
    </ContextMenuItem>
    <ContextMenuItem onClick={() => onAction('duplicate', file)}>
      <Copy className="w-4 h-4 mr-2" />
      Duplicate
    </ContextMenuItem>
  </ContextMenu>
)
```

#### Code Editor (✅ Monaco exists, needs features)
**Current**: `components/workspace/editor-panel.tsx`  
**Required Features**:
- [x] Monaco editor
- [ ] Syntax highlighting (all languages)
- [ ] IntelliSense / autocomplete
- [ ] Multiple tabs
- [ ] Split view (side-by-side editors)
- [ ] Minimap
- [ ] Breadcrumbs
- [ ] Go to definition
- [ ] Find/Replace (Ctrl+F)
- [ ] Format document
- [ ] Code folding
- [ ] Bracket matching
- [ ] Auto-save

**Implementation**:
```typescript
// Enhance editor-panel.tsx with Monaco features
const editorOptions = {
  minimap: { enabled: true },
  folding: true,
  bracketPairColorization: { enabled: true },
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  formatOnPaste: true,
  formatOnType: true,
  quickSuggestions: true,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnCommitCharacter: true,
  wordBasedSuggestions: true,
}
```

#### Terminal (🟡 Exists, needs full functionality)
**Current**: `components/workspace/panels/terminal-panel.tsx`  
**Current Issue**: Tries to connect to non-existent WebSocket

**Required Features**:
- [ ] Working bash/zsh terminal
- [ ] Multiple terminal instances/tabs
- [ ] Terminal splitting
- [ ] Terminal history
- [ ] Copy/paste support
- [ ] Color output support
- [ ] Working directory tracking
- [ ] Command execution with real output

**Implementation Options**:
1. **WebContainer API** (browser-based Node.js) - Already imported
2. **WebSocket Terminal Service** (requires backend)
3. **Simulated Terminal** (for demos)

**Decision**: Use WebContainer API for real implementation:
```typescript
import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer;

async function initTerminal() {
  webcontainerInstance = await WebContainer.boot();
  const process = await webcontainerInstance.spawn('bash', []);
  
  process.output.pipeTo(new WritableStream({
    write(data) {
      terminal.write(data);
    }
  }));
}
```

#### Source Control (🟡 Partial, needs Git integration)
**Current**: `components/workspace/views/source-control-view.tsx`  
**Required Features**:
- [ ] Git status (modified, staged, untracked files)
- [ ] Stage/unstage files
- [ ] Commit with message
- [ ] Push/Pull from remote
- [ ] Branch management
- [ ] Diff view
- [ ] Merge conflict resolution
- [ ] Git history/log

**Implementation**: Use `isomorphic-git` (already in dependencies)
```typescript
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

async function gitCommit(message: string) {
  await git.commit({
    fs,
    dir: '/project',
    message,
    author: {
      name: user.name,
      email: user.email,
    },
  });
}
```

#### Search (🟡 Exists, needs enhancement)
**Current**: `components/workspace/views/search-view.tsx`  
**Required Features**:
- [ ] Search in files (content)
- [ ] Search and replace
- [ ] Regex support
- [ ] Case sensitive toggle
- [ ] Whole word toggle
- [ ] File type filters
- [ ] Search in specific folders

#### Extensions (❌ Shell only)
**Current**: `components/workspace/views/extensions-view.tsx`  
**Required Features**:
- [ ] Browse extension marketplace
- [ ] Install extensions
- [ ] Enable/disable extensions
- [ ] Configure extension settings
- [ ] Extension recommendations

**Simplified Approach**: Pre-bundle essential extensions
- ESLint
- Prettier
- GitLens
- Tailwind CSS IntelliSense
- TypeScript helpers

#### Debug Console (❌ Shell only)
**Current**: `components/workspace/panels/debug-view.tsx`  
**Required Features**:
- [ ] Breakpoint support
- [ ] Step over/into/out
- [ ] Variable inspection
- [ ] Watch expressions
- [ ] Call stack view
- [ ] Debug console

**Simplified Approach**: Basic console logging first
```typescript
// Simple debug output
const DebugConsole = () => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    // Intercept console.log
    const originalLog = console.log;
    console.log = (...args) => {
      setLogs(prev => [...prev, args.join(' ')]);
      originalLog(...args);
    };
  }, []);
  
  return <div className="debug-console">{logs.map(log => <div>{log}</div>)}</div>;
};
```

#### Problems Panel (✅ Shell exists)
**Current**: `components/workspace/panels/problems-view.tsx`  
**Required Features**:
- [ ] Show ESLint errors/warnings
- [ ] Show TypeScript errors
- [ ] Show build errors
- [ ] Click to navigate to error
- [ ] Filter by severity
- [ ] Group by file

#### Output Panel (✅ Shell exists)
**Current**: `components/workspace/panels/output-view.tsx`  
**Required Features**:
- [ ] Show build output
- [ ] Show test output
- [ ] Show extension logs
- [ ] Channel selector (Tasks, Debug, Extensions)
- [ ] Clear output button

### 3.2 Advanced Code Features

#### Live Preview
**Create**: `components/workspace/panels/preview-panel.tsx` (enhance)  
**Required Features**:
- [ ] Live HTML/CSS/JS preview
- [ ] Hot reload on file save
- [ ] Responsive preview (mobile/tablet/desktop)
- [ ] Browser DevTools integration
- [ ] Network request inspector

**Implementation**: Use iframe with postMessage
```typescript
const PreviewPanel = ({ html, css, js }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head><style>${css}</style></head>
          <body>${html}<script>${js}</script></body>
        </html>
      `);
      doc.close();
    }
  }, [html, css, js]);
  
  return <iframe ref={iframeRef} className="w-full h-full border-0" />;
};
```

#### Code Execution
**Current**: `app/api/buildspaces/execute/route.ts`  
**Already Implemented**: ✅ Piston API integration  
**Enhancement Needed**:
- [ ] Support more languages (currently JavaScript, Python, etc.)
- [ ] Better error handling and output formatting
- [ ] Execution history
- [ ] Save execution results

#### Collaborative Editing
**Current**: Yjs already in dependencies  
**Required**:
- [ ] Real-time cursor positions
- [ ] User presence indicators
- [ ] Collaborative file editing
- [ ] Chat/comments on code
- [ ] Shared terminal sessions

**Implementation**: Already started in `collaboration-pod.tsx`

### 3.3 Keyboard Shortcuts (VSCode Compatibility)
**Create**: `lib/hooks/use-keyboard-shortcuts.ts`

**Essential Shortcuts**:
```typescript
const shortcuts = {
  'Ctrl+S': 'Save file',
  'Ctrl+P': 'Quick open file',
  'Ctrl+Shift+P': 'Command palette',
  'Ctrl+B': 'Toggle sidebar',
  'Ctrl+`': 'Toggle terminal',
  'Ctrl+/': 'Toggle comment',
  'Ctrl+F': 'Find',
  'Ctrl+H': 'Replace',
  'F5': 'Start debugging',
  'Ctrl+Shift+F': 'Search in files',
  'Ctrl+Tab': 'Switch between files',
  'Ctrl+W': 'Close file',
  'Alt+Up/Down': 'Move line up/down',
  'Shift+Alt+Up/Down': 'Copy line up/down',
}
```

### 3.4 Command Palette
**Create**: `components/workspace/command-palette.tsx`

**Features**:
- Fuzzy search for commands
- Recently used commands
- Keyboard shortcut hints
- Quick file navigation
- Theme switching
- Settings access

---

## 🎯 PHASE 4: Demo Pages (Fully Functional) (Days 13-15)

### 4.1 Demo Strategy

Each demo should:
1. **Use Real Components** - No separate demo components, use actual workspace components
2. **Pre-populated Data** - Sample projects, files, and content
3. **Limited Execution** - Execute in browser only, no cloud resources
4. **No Auth Required** - Anyone can try
5. **Upgrade Prompts** - Show what's available in full version
6. **Interactive** - All basic features work

### 4.2 Demo Code Chamber

**File**: `app/demo-code-chamber/page.tsx` (update)

**Features**:
- ✅ Full Monaco editor
- ✅ File explorer with sample project
- ✅ Working terminal (WebContainer)
- ✅ Code execution (JavaScript/TypeScript)
- ✅ Live preview
- ❌ No Git (show "Upgrade for Git")
- ❌ No cloud sync (show "Upgrade for cloud storage")
- ❌ Limited languages (JS/TS only)

**Sample Project**:
```
demo-project/
├── index.html
├── styles.css
├── script.js
├── README.md
└── package.json
```

### 4.3 Demo Spec Chamber

**File**: `app/demo-spec-chamber/page.tsx`

**Features**:
- ✅ YAML spec editor
- ✅ AI code generation (1 free generation)
- ✅ Preview generated code
- ❌ No project creation (show "Upgrade to save")
- ❌ Limited generations (1 per session)

### 4.4 Demo Design Studio

**File**: `app/demo-design-studio/page.tsx`

**Features**:
- ✅ Figma URL input
- ✅ Preview design
- ✅ Generate code (1 free generation)
- ❌ No actual Figma API (use sample design)
- ❌ Limited exports

### 4.5 Demo Command Desk

**File**: `app/demo-command-desk/page.tsx`

**Features**:
- ✅ Chat interface
- ✅ Slash commands
- ✅ AI responses (limited)
- ❌ No task creation
- ❌ Limited AI calls (3 per session)

### 4.6 Demo AI Studio

**File**: `app/demo-ai-studio/page.tsx`

**Features**:
- ✅ Jupyter-like notebook
- ✅ Execute cells (browser only)
- ✅ Visualizations
- ❌ No Python (JS only)
- ❌ No GPU access

### 4.7 Demo Knowledge Ocean

**File**: `app/demo-knowledge-ocean/page.tsx`

**Features**:
- ✅ Search interface
- ✅ Browse sample knowledge base
- ✅ View code snippets
- ❌ No project indexing
- ❌ Sample data only

### 4.8 Demo Maker Lab

**File**: `app/demo-maker-lab/page.tsx`

**Features**:
- ✅ Database schema designer
- ✅ Visual schema editor
- ✅ Generate Prisma schema
- ❌ No actual database
- ❌ No deployment

---

## 🔗 PHASE 5: Fix All Broken Links & Buttons (Day 16)

### 5.1 Navigation Links Audit

**Homepage** (`app/page.tsx`):
- [ ] "Get Started" button → `/auth/signup`
- [ ] "Try Demo" button → `/demo-code-chamber`
- [ ] "View Pricing" link → `/pricing`
- [ ] "Learn More" links → respective feature pages
- [ ] Navigation menu → all pages exist

**Feature Pages** (`app/features/*`):
- [ ] All "Try Demo" buttons → respective demo pages
- [ ] All "Learn More" links → valid URLs
- [ ] Back buttons → return to features index

**Demo Pages** (`app/demo-*`):
- [ ] "Back to Features" links → correct feature page
- [ ] "Get Full Access" buttons → `/pricing` or `/auth/signup`
- [ ] "Upgrade" prompts → `/pricing`

**Workspace** (`app/workspace/page.tsx`):
- [ ] All room selector buttons → switch rooms correctly
- [ ] Settings button → `/settings`
- [ ] Profile button → dropdown with logout
- [ ] Help button → `/docs`

### 5.2 Button Functionality Audit

**Action Buttons**:
- [ ] All "Save" buttons → save to database
- [ ] All "Run" buttons → execute code
- [ ] All "Generate" buttons → call AI API
- [ ] All "Deploy" buttons → deployment flow
- [ ] All "Delete" buttons → confirmation + delete

**Form Buttons**:
- [ ] All "Submit" buttons → POST to API
- [ ] All "Cancel" buttons → close dialog/reset form
- [ ] All "Reset" buttons → clear form

**Toggle Buttons**:
- [ ] Sidebar toggle → show/hide sidebar
- [ ] Terminal toggle → show/hide terminal
- [ ] AI panel toggle → show/hide AI assistant
- [ ] Preview toggle → show/hide preview

---

## ⚖️ PHASE 6: Constitutional Alignment Verification (Day 17)

### 6.1 No Mock Protocol Compliance

**Verify all components start empty or load real data**:

| Component | Mock Data Status | Action Required |
|-----------|-----------------|-----------------|
| Command Desk | ❌ Has `initialMessages` | Remove, load from DB |
| Knowledge Ocean | ❌ Has `projectKnowledge` | Remove, load from API |
| Design Studio | ❌ Fake Figma import | Implement real API |
| AI Studio | ❌ Has `INITIAL_CELLS` | Remove, start empty |
| Maker Lab | ❌ Hardcoded schema | Remove, load from DB |
| Task Board | ✅ Starts empty | No action |
| Code Chamber | ✅ Loads from FS | No action |
| Spec Chamber | ✅ No mock data | No action |

### 6.2 Truth Mandate Compliance

**Verify no fake functionality**:
- [ ] All "Execute" buttons actually execute
- [ ] All "Save" buttons actually save
- [ ] All "Generate" buttons call real AI
- [ ] All metrics show real data
- [ ] All stats are calculated, not hardcoded

### 6.3 Constitutional AI Validation

**Verify all AI commands validated**:
- [ ] Terminal commands pass through `constitutional-ai.ts`
- [ ] Code generation validated before injection
- [ ] Dangerous operations blocked or warned
- [ ] Audit logs generated

### 6.4 Security Review

**Constitutional Security Principles**:
- [ ] No secrets in code
- [ ] All user input sanitized
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection (NextAuth)
- [ ] Rate limiting on expensive ops

---

## 🧪 PHASE 7: Testing & Quality Assurance (Days 18-20)

### 7.1 Unit Tests

**Coverage Target**: 80%

**Create tests for**:
- [ ] All API routes
- [ ] All services
- [ ] All utilities
- [ ] Critical hooks
- [ ] Store logic

**Run**: `npm test`

### 7.2 Integration Tests

**Test component interactions**:
- [ ] File explorer → Editor
- [ ] Editor → Terminal
- [ ] Terminal → Output
- [ ] Spec Chamber → Code Chamber
- [ ] Design Studio → Code Chamber
- [ ] Command Desk → All rooms

### 7.3 E2E Tests

**Create Playwright tests for**:
- [ ] User signup and login
- [ ] Create and edit project
- [ ] Execute code
- [ ] AI code generation
- [ ] Real-time collaboration
- [ ] Git operations
- [ ] Demo flows

**Run**: `npm run test:e2e`

### 7.4 Load Testing

**Test with k6**:
- [ ] 100 concurrent users
- [ ] Code execution load
- [ ] WebSocket connections
- [ ] Database queries
- [ ] API endpoints

### 7.5 Manual Testing Checklist

**Test each room**:
- [ ] Code Chamber: Create file, edit, execute, save
- [ ] Spec Chamber: Write spec, generate code, apply
- [ ] Design Studio: Import design, generate code
- [ ] AI Studio: Create notebook, execute cells
- [ ] Command Desk: Send command, get response
- [ ] Maker Lab: Design schema, generate code
- [ ] Knowledge Ocean: Search, browse, view
- [ ] Task Board: Create task, update, complete
- [ ] Collaboration Pod: Join, edit together, chat

**Test demos**:
- [ ] Each demo loads without errors
- [ ] Sample data visible
- [ ] Basic interactions work
- [ ] Upgrade prompts show correctly
- [ ] Links to full version work

**Test auth flow**:
- [ ] Signup works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes redirect
- [ ] Session persists

**Test navigation**:
- [ ] All menu links work
- [ ] All buttons have actions
- [ ] Back buttons work
- [ ] Breadcrumbs work
- [ ] Deep links work

---

## 🚀 PHASE 8: Production Deployment (Days 21-22)

### 8.1 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Docker builds successfully
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Secrets configured in K8s
- [ ] Health checks working
- [ ] Monitoring configured
- [ ] Backups configured

### 8.2 Staging Deployment

- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Verify all features work
- [ ] Check performance
- [ ] Review logs
- [ ] Fix any issues

### 8.3 Production Deployment

- [ ] Final security review
- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Verify health checks
- [ ] Test critical flows
- [ ] Announce launch

### 8.4 Post-Deployment

- [ ] Monitor for 24 hours
- [ ] Respond to issues
- [ ] Document learnings
- [ ] Plan improvements
- [ ] Celebrate! 🎉

---

## 📊 Progress Tracking

### By Phase
- Phase 1 (Infrastructure): 0/5 (0%)
- Phase 2 (Fix Broken): 0/4 (0%)
- Phase 3 (Code Chamber): 0/30 (0%)
- Phase 4 (Demos): 0/7 (0%)
- Phase 5 (Links/Buttons): 0/3 (0%)
- Phase 6 (Constitutional): 0/4 (0%)
- Phase 7 (Testing): 0/5 (0%)
- Phase 8 (Deployment): 0/4 (0%)

**Total**: 0/62 (0%)

### By Priority
- 🔴 Critical: 0/35 (0%)
- 🟠 High: 0/18 (0%)
- 🟡 Medium: 0/9 (0%)

---

## 🎯 Success Criteria

### Code Chamber = Codespaces
- [ ] File explorer with full CRUD
- [ ] Monaco editor with IntelliSense
- [ ] Working terminal (multiple tabs)
- [ ] Git integration (commit, push, pull)
- [ ] Search and replace
- [ ] Extensions support
- [ ] Debug console
- [ ] Live preview
- [ ] Collaborative editing
- [ ] Keyboard shortcuts

### Demos Fully Functional
- [ ] All 7 demos work without auth
- [ ] Pre-populated with sample data
- [ ] Interactive and responsive
- [ ] Show upgrade prompts
- [ ] Link to full version

### No Broken Links/Buttons
- [ ] All navigation works
- [ ] All buttons have actions
- [ ] All forms submit correctly
- [ ] All toggles work
- [ ] All modals open/close

### Constitutional Compliance
- [ ] No mock data
- [ ] All features truthful
- [ ] AI validation working
- [ ] Security principles met
- [ ] Audit logs active

### Production Ready
- [ ] Docker container runs
- [ ] All tests passing
- [ ] 80%+ code coverage
- [ ] Load tested
- [ ] Security reviewed
- [ ] Monitoring active
- [ ] Deployed and live

---

## 📝 Implementation Notes

### Order of Operations
1. **Infrastructure first** - Can't deploy without Dockerfile
2. **Fix broken components** - Can't test if components crash
3. **Code Chamber** - Most complex, needs most time
4. **Demos** - Reuse Code Chamber work
5. **Polish links/buttons** - Quick wins
6. **Verify constitutional** - Ensure compliance
7. **Test everything** - No skipping
8. **Deploy carefully** - Staging first

### Team Coordination
- **Developer 1**: Infrastructure + Code Chamber
- **Developer 2**: Demos + Links/Buttons
- **QA**: Testing + Constitutional verification
- **DevOps**: Deployment + Monitoring

### Timeline
- **Week 1**: Phases 1-2 (Infrastructure + Fixes)
- **Week 2**: Phase 3 (Code Chamber)
- **Week 3**: Phases 4-5 (Demos + Polish)
- **Week 4**: Phases 6-8 (Testing + Deployment)

**Total**: 4 weeks to production-ready

---

**Last Updated**: January 9, 2026  
**Next Review**: Daily during implementation

**Built with Ubuntu Philosophy** 💚  
*"I am because we are"*
