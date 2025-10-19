# Azora OS

A modular, production-grade, UI-compliant, next-gen AI OS with 100+ advanced services and a beautiful React UI.

## Monorepo Structure

- \`apps/main-app\` — React UI (atomic, themeable, accessible)
- \`services/*\` — Node.js microservices (AI, quantum, blockchain, compliance, etc.)
- \`ui-overhaul/*\` — Atomic UI components, themes, design tokens
- \`shared/*\` — Shared hooks, utils

## Quickstart

1. **Install dependencies:**  
   \`npm install\` (in repo root)

2. **Start all services & UI for development:**  
   \`npm run dev\`

3. **Production build and launch:**  
   \`npm run build && npm start\`

4. **Lint & test:**  
   \`npm run lint\`  
   \`npm run test\`

## Environment

Copy \`.env.example\` to \`.env\` and adjust as needed.

## Customizing

- Add/edit microservices in \`/services\`
- Add new UI panels in \`/apps/main-app/src/pages/services\`
- Update UI tokens/components in \`/ui-overhaul\`
- Use \`shared/\` for common logic

## To deploy:
- Use \`docker-compose up --build\` for all-in-one
- Or deploy UI and services separately as containers

Accessibility, dark/light theming, and atomic UI are fully supported.

---

## PWA, Push Notifications, and App Store/Play Store

- Azora OS is a full PWA: installable on iOS & Android, works offline, supports push notifications.
- To enable web push, configure your VAPID keys and a push backend (e.g., using web-push npm module).
- For App Store/Play Store: Use manifest, icons, and screenshots. For Play Store, use [PWABuilder](https://www.pwabuilder.com/).
- Mobile-first UI is guaranteed via responsive CSS and atomic components.


---

## PWA, Push Notifications, and App Store/Play Store

- Azora OS is a full PWA: installable on iOS & Android, works offline, supports push notifications.
- To enable web push, configure your VAPID keys and a push backend (e.g., using web-push npm module).
- For App Store/Play Store: Use manifest, icons, and screenshots. For Play Store, use [PWABuilder](https://www.pwabuilder.com/).
- Mobile-first UI is guaranteed via responsive CSS and atomic components.


---

## PWA, Push Notifications, and App Store/Play Store

- Azora OS is a full PWA: installable on iOS & Android, works offline, supports push notifications.
- To enable web push, configure your VAPID keys and a push backend (e.g., using web-push npm module).
- For App Store/Play Store: Use manifest, icons, and screenshots. For Play Store, use [PWABuilder](https://www.pwabuilder.com/).
- Mobile-first UI is guaranteed via responsive CSS and atomic components.


---

## PWA, Push Notifications, and App Store/Play Store

- Azora OS is a full PWA: installable on iOS & Android, works offline, supports push notifications.
- To enable web push, configure your VAPID keys and a push backend (e.g., using web-push npm module).
- For App Store/Play Store: Use manifest, icons, and screenshots. For Play Store, use [PWABuilder](https://www.pwabuilder.com/).
- Mobile-first UI is guaranteed via responsive CSS and atomic components.

