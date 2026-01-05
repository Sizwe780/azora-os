# 🏗️ Azora BuildSpaces - Project Structure

This document outlines the organized structure of the Azora BuildSpaces application to ensure code maintainability and prevent misplaced files.

## 📂 Directory Overview

### 1. `app/` (Next.js App Router)
- `app/page.tsx`: Main landing page.
- `app/workspace/page.tsx`: The core BuildSpaces application (Room Orchestrator).
- `app/features/`: Landing pages for individual features (marketing/info).
- `app/api/`: Backend API routes for code execution, AI agents, and project management.

### 2. `components/` (React Components)
- `components/ui/`: Base UI components (shadcn/ui).
- `components/layout/`: Global layout components (Navbar, Footer).
- `components/rooms/`: Core "Room" implementations used in the Workspace.
  - `code-chamber.tsx`
  - `spec-chamber.tsx`
  - `design-studio.tsx`
  - `ai-studio.tsx`
  - `maker-lab.tsx`
  - ...
- `components/workspace/`: Workspace-specific UI (Sidebar, Header, Panels).
- `components/shared/`: Components used across both landing pages and the workspace.
- `components/landing/`: Components specific to the landing page.

### 3. `lib/` (Core Logic)
- `lib/stores/`: Zustand state management (file system, workbench state).
- `lib/hooks/`: Custom React hooks.
- `lib/utils/`: Utility functions.

### 4. `services/` (External Integrations)
- `services/agent-factory.ts`: Orchestrates AI agent creation.
- `services/build-agent.ts`: Logic for the Build agent.

### 5. `standalone/` (Reference & Legacy)
- Contains standalone versions of features or legacy code kept for reference but not part of the main application flow.
- `standalone/code-chamber/`: Standalone IDE implementation.
- `standalone/spec-chamber/`: Standalone requirements tool.
- `standalone/command-desk/`: Standalone terminal tool.

### 6. `lib/services/` (Application Services)
- `lib/services/auth-service.ts`: Bridge between NextAuth and the Dashboard.
- `lib/services/file-system.ts`: Virtual file system service.
- `lib/services/agent-orchestrator.ts`: AI agent management.

---

## 🛠️ Key Connections

- **Workspace Orchestration**: `app/workspace/page.tsx` acts as the central hub, importing rooms from `components/rooms/`.
- **State Management**: `lib/stores/file-system.ts` manages the virtual file system used by the Code Chamber.
- **AI Integration**: Rooms call API routes in `app/api/agents/` which in turn use the `services/` layer to interact with the Sankofa AI Engine.

## 🛡️ Constitutional Compliance
- **No Mock Protocol**: All rooms are being transitioned from simulated logic to real API calls.
- **Ubuntu Philosophy**: Code is structured to be modular and reusable across the Azora ecosystem.
