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

## Recommended GitHub Issues

### High Priority Issues
1. **Merge Dependabot PRs** (`priority: critical`, `type: security`)
   - Merge all 15 open Dependabot PRs for dependency updates
   - Test each update to ensure compatibility
   - Update security documentation

2. **Add Repository Description** (`priority: high`, `type: documentation`)
   - Add compelling GitHub repository description
   - Suggested: "Azora OS: Constitutional AI for planetary-scale economic coordination and human flourishing"

3. **Verify Service Implementations** (`priority: high`, `type: testing`)
   - Verify Aegis Citadel API endpoints work correctly
   - Test Azora Sapiens education platform functionality
   - Validate Azora Mint economic engine operations
   - Confirm Azora Oracle intelligence services

### Medium Priority Issues
4. **Code Quality Improvements** (`priority: medium`, `type: enhancement`)
   - Enable and fix ESLint warnings/errors
   - Enable and fix Prettier formatting issues
   - Add TypeScript strict mode checks

5. **Deployment Testing** (`priority: medium`, `type: testing`)
   - Test Docker container builds for all services
   - Verify docker-compose orchestration
   - Add health check endpoints to all services
   - Test Kubernetes deployment manifests

6. **Documentation Updates** (`priority: medium`, `type: documentation`)
   - Update README claims to reflect actual implementation status
   - Add API documentation for implemented endpoints
   - Create deployment guides for different environments

### Low Priority Issues
7. **Repository Optimization** (`priority: low`, `type: enhancement`)
   - Audit repository size (currently ~138MB)
   - Consider adding .gitignore rules for large files
   - Optimize Docker image sizes

8. **Community Building** (`priority: low`, `type: enhancement`)
   - Set up Discord server for real-time collaboration (discord.gg/azora-os)
   - Launch forum.azora.world for technical discussions
   - Create detailed issue templates for contributions
   - Add good-first-issue labels to beginner-friendly tasks
   - Clarify contributor account structure

## Automation Rules
1. New issues automatically get priority: medium and status: ready
2. PRs automatically get type labels based on title
3. Issues with security label get assigned to security team
4. Stale issues get closed after 30 days of inactivity
5. PRs require at least 1 approval before merge