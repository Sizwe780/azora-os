# Knowledge Ocean - Phases 9, 10, 11 Implementation

## Overview

The Knowledge Ocean is a RAG (Retrieval-Augmented Generation) system that gives AI agents access to the full repository context. It implements three main components:

1. **The Indexer** - Converts the Virtual File System into searchable vectors
2. **OmniSearch UI** - A Command Palette (Cmd+K) for universal search
3. **Sankofa Agent** - "The Archivist" specializing in context retrieval

## Components

### 1. Knowledge Indexer (`lib/knowledge/indexer.ts`)

The indexer crawls the VFS and builds a searchable index using MiniSearch for local, privacy-first keyword/fuzzy search.

**Features:**
- Recursive file scanning
- Code chunking (functions, classes, components, interfaces, types)
- Language detection
- MiniSearch integration for fast keyword search
- Fuzzy matching support
- Stub for future vector embeddings

**Usage:**
```typescript
import { getKnowledgeIndexer, initializeKnowledgeEngine } from '@/lib/knowledge/indexer'

// Initialize and index a project
const stats = await initializeKnowledgeEngine('/')

// Get the indexer instance
const indexer = getKnowledgeIndexer()

// Search
const results = indexer.search('login', 10)

// Find context for agents
const context = await indexer.findContext('authentication', 5)
```

**Code Extraction:**
- Functions (regular and arrow functions)
- Classes
- React components (default exports)
- Interfaces
- Type aliases
- API routes (Next.js convention)

### 2. OmniSearch Component (`components/rooms/knowledge-ocean/omni-search.tsx`)

A Command Palette interface for searching the codebase.

**Features:**
- Global keyboard shortcut: Cmd+K (Mac) / Ctrl+K (Windows/Linux)
- Two search modes:
  - **Keyword Search**: Direct keyword/fuzzy matching
  - **Concept Search**: Semantic search using Sankofa agent
- Keyboard navigation (Arrow keys, Enter, Escape)
- Type filtering and syntax highlighting
- Real-time search with debouncing

**Usage:**
```typescript
import OmniSearch, { useOmniSearch } from '@/components/rooms/knowledge-ocean/omni-search'

function MyComponent() {
  const { open, setOpen } = useOmniSearch()
  
  return (
    <OmniSearch 
      open={open} 
      onOpenChange={setOpen}
      onSelectFile={(path, line) => {
        // Handle file selection
      }}
    />
  )
}
```

### 3. Sankofa Agent (`lib/agents/sankofa-interface.ts`)

"The Archivist" - specializes in knowledge retrieval and context finding.

**Sankofa Principle:**
> "Se wo were fi na wosankofa a yenkyi"  
> "It is not wrong to go back for that which you have forgotten"

**Features:**
- Context finding: Returns top N relevant code snippets
- Question answering: Extracts key terms and finds relevant code
- Similar code detection
- Codebase statistics
- Dependency graph preparation (stub)

**Usage:**
```typescript
import { getSankofa, findContext, askSankofa } from '@/lib/agents/sankofa-interface'

// Quick helpers
const context = await findContext('authentication', 5)
const answer = await askSankofa('How does login work?')

// Full API
const sankofa = getSankofa()

// Find specific code
const loginFunctions = await sankofa.findByName('login', 'function')

// Get file context
const authCode = await sankofa.getFileContext('/src/auth.ts')

// Get statistics
const stats = await sankofa.getCodebaseStats()
```

## API Routes

### `/api/knowledge/index`

Triggers indexing of the project.

**POST Request:**
```json
{
  "rootPath": "/"
}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalFiles": 50,
    "totalChunks": 250,
    "languages": { "typescript": 40, "javascript": 10 },
    "lastIndexed": "2026-01-09T01:00:00.000Z"
  },
  "message": "Indexed 50 files with 250 code chunks"
}
```

### `/api/knowledge/search`

Search the knowledge base.

**POST Request:**
```json
{
  "query": "authentication",
  "mode": "local",
  "maxResults": 10
}
```

**GET Request:**
```
/api/knowledge/search?q=authentication&mode=local&limit=10
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "auth.ts:function:login",
      "path": "/src/auth.ts",
      "fileName": "auth.ts",
      "type": "function",
      "name": "login",
      "content": "async function login(...) { ... }",
      "score": 0.95,
      "language": "typescript"
    }
  ],
  "total": 5,
  "query": "authentication",
  "mode": "local"
}
```

## Constitutional Compliance

### 1. Truth as Currency

The indexer prioritizes production code over comments and mocks:
- Extracts actual function/class definitions
- Ignores comments in relevance scoring
- Focuses on executable code

### 2. Privacy First

**Default: Local Search**
- Uses MiniSearch for local keyword search
- No data leaves the browser/server
- Fast and private

**Future: Embeddings (Optional)**
- When embedding generation is added, users must be warned:
  ```
  "Indexing sends code to [Provider]. Confirm?"
  ```
- User consent required before external API calls
- Option to use local models

### 3. Single Source of Truth

- Integrates with existing VFS (`lib/workspace/file-system.ts`)
- No duplicate file storage
- Real-time updates when files change (future enhancement)

## Testing

Tests are located in:
- `tests/lib/knowledge/indexer.test.ts`
- `tests/lib/agents/sankofa-interface.test.ts`

Run tests:
```bash
npm test
```

## Future Enhancements

### Phase 9+ Extensions

1. **Vector Embeddings**
   - Integrate OpenAI/Cohere/local embeddings
   - Semantic similarity search
   - Better concept matching

2. **Real-time Indexing**
   - Watch file changes
   - Incremental updates
   - WebSocket notifications

3. **Dependency Graph**
   - Parse import statements
   - Build complete dependency graph
   - Visualize relationships

4. **Advanced Filtering**
   - Date ranges
   - Author filtering (git blame)
   - File size/complexity metrics

5. **Agent Integration**
   - Elara auto-queries before answering
   - Context injection into agent prompts
   - Knowledge-enhanced code generation

## Architecture

```
┌─────────────────────────────────────────┐
│         Knowledge Ocean System          │
└─────────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐      ┌──────▼──────┐
│ VFS    │      │  MiniSearch  │
│ Reader │──────│   Index      │
└────────┘      └──────┬───────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
     ┌────▼───┐  ┌────▼────┐  ┌───▼─────┐
     │Indexer │  │Sankofa  │  │OmniSearch│
     │        │  │ Agent   │  │   UI     │
     └────────┘  └─────────┘  └──────────┘
```

## Performance Considerations

- **Initial Indexing**: O(n) where n = number of files
- **Search**: O(log n) with MiniSearch index
- **Memory**: ~1KB per code chunk
- **Typical Project**: 1000 files = ~5MB memory

## Dependencies

- `minisearch` (v7.1.0): Fast, local full-text search
- `lightning-fs`: Browser-based file system (existing)
- `isomorphic-git`: Git operations (existing)

## References

- [MiniSearch Documentation](https://lucaong.github.io/minisearch/)
- [Phoenix Protocol](../PHOENIX-PROTOCOL-COMPLETE.md)
- [VFS Implementation](../lib/workspace/file-system.ts)
- [Agent Architecture](../lib/agents/README.md)
