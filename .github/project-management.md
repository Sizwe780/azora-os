# GitHub Project Configuration
# This file documents the project management setup for Azora OS

## Project Boards
- **Azora OS Development**: Main development board
  - Columns: Backlog, In Progress, Review, Done
  - Automation: Auto-assign issues, auto-label PRs

- **Security & Compliance**: Security-focused board
  - Columns: Vulnerabilities, Audits, Compliance, Resolved

- **Community**: Community engagement board
  - Columns: Ideas, Discussions, Events, Outreach

## Labels
### Priority
- `priority: critical` - Mission critical, blocks releases
- `priority: high` - Important, should be addressed soon
- `priority: medium` - Normal priority
- `priority: low` - Nice to have, can be deferred

### Type
- `type: bug` - Bug fixes
- `type: feature` - New features
- `type: enhancement` - Feature improvements
- `type: documentation` - Documentation updates
- `type: security` - Security-related
- `type: performance` - Performance improvements
- `type: refactoring` - Code refactoring
- `type: testing` - Testing improvements

### Status
- `status: ready` - Ready for development
- `status: blocked` - Blocked by dependencies
- `status: help-wanted` - Needs community help
- `status: good-first-issue` - Good for new contributors

### Component
- `component: aegis` - Azora Aegis (security)
- `component: nexus` - Azora Nexus (AI agent)
- `component: covenant` - Azora Covenant (blockchain)
- `component: forge` - Azora Forge (marketplace)
- `component: mint` - Azora Mint (DeFi)
- `component: ui` - User interfaces
- `component: api` - API services
- `component: infrastructure` - Infrastructure/deployment

## Milestones
- **v1.0.0**: Initial release
- **v1.1.0**: Feature enhancements
- **v2.0.0**: Major architecture updates

## Automation Rules
1. New issues automatically get priority: medium and status: ready
2. PRs automatically get type labels based on title
3. Issues with security label get assigned to security team
4. Stale issues get closed after 30 days of inactivity
5. PRs require at least 1 approval before merge