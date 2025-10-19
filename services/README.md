# Azora OS

A production-grade, next-gen, UI-compliant autonomous AI OS.  
Monorepo structure with 100+ modular services, atomic UI, and clean DevOps.

## Structure
- apps/main-app: React UI
- services: Node.js microservices
- ui-overhaul: Design system
- shared: Hooks, utils, types

## Getting Started

1. Install dependencies: `yarn install` or `npm install`
2. Start all services: `docker-compose up --build`
3. Start UI: `cd apps/main-app && npm start`
