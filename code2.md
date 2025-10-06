# Azora OS full update: backend, frontend, realtime, PWA, and responsive UX

You’ve got the skeleton and muscles; this wraps all missing pieces into a cohesive, shippable system: payments, subscriptions, partners, drivers, jobs, audit, analytics, legal, localization, routing, dark/light mode, PWA, and live GPS tracking. It’s pragmatic and drop-in. If you want me to upgrade any of your existing files, tell me the exact paths and I’ll refactor them to production quality.

---

## Backend foundation and security

### Prisma schema essentials

```prisma
// prisma/schema.prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  role          String   // 'admin' | 'driver' | 'dispatcher' | 'partner'
  passwordHash  String
  companyId     String?
  company       Company? @relation(fields: [companyId], references: [id])
  createdAt     DateTime @default(now())
  payments      Payment[]
}

model Company {
  id                 String   @id @default(cuid())
  name               String
  vatNumber          String?
  vatPercent         Int      @default(15)
  billingEmail       String?
  popiaConsent       Boolean  @default(false)
  pilotActive        Boolean  @default(false)
  pilotActivatedAt   DateTime?
  subscriptionStatus String   @default("none") // 'none' | 'active' | 'past_due' | 'canceled'
  tenants            Tenant[]
  jobs               Job[]
  payments           Payment[]
  createdAt          DateTime @default(now())
}

model Job {
  id         String   @id @default(cuid())
  companyId  String
  company    Company  @relation(fields: [companyId], references: [id])
  ref        String
  pickup     Json
  dropoff    Json
  status     String   // 'new' | 'assigned' | 'in_transit' | 'delivered' | 'failed'
  driverId   String?
  etaMinutes Int?
  tracking   Json?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([ref, companyId], name: "ref_companyId")
}

model Payment {
  id        String   @id @default(cuid())
  reference String   @unique
  provider  String   // 'paystack' | 'yoco'
  status    String   // 'success' | 'failed' | 'pending'
  amount    Int
  currency  String
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  companyId String?
  company   Company? @relation(fields: [companyId], references: [id])
  raw       Json
  createdAt DateTime @default(now())
}

model Plan {
  id             String  @id @default(cuid())
  code           String  @unique
  name           String
  priceZarCents  Int
  interval       String  // 'monthly' | 'annual'
  features       Json
  active         Boolean @default(true)
}

model Subscription {
  id               String   @id @default(cuid())
  companyId        String
  company          Company  @relation(fields: [companyId], references: [id])
  planId           String
  plan             Plan     @relation(fields: [planId], references: [id])
  status           String   // 'active' | 'past_due' | 'canceled'
  currentPeriodEnd DateTime
  provider         String   // 'paystack'
  providerRef      String?
  createdAt        DateTime @default(now())
}

model Audit {
  id        String   @id @default(cuid())
  companyId String
  actorId   String?
  type      String   // 'payment' | 'job' | 'settings' | 'partner' | 'subscription' | 'integration'
  action    String
  meta      Json
  createdAt DateTime @default(now())
}

model Partner {
  id              String   @id @default(cuid())
  name            String
  email           String   @unique
  code            String?  @unique
  commissionRate  Int      // bps: 1000 = 10%
  active          Boolean  @default(true)
  payouts         Payout[]
  referrals       Referral[]
}

model Referral {
  id         String  @id @default(cuid())
  partnerId  String
  partner    Partner @relation(fields: [partnerId], references: [id])
  companyId  String
  company    Company @relation(fields: [companyId], references: [id])
  source     String
  createdAt  DateTime @default(now())
}

model Payout {
  id          String  @id @default(cuid())
  partnerId   String
  partner     Partner @relation(fields: [partnerId], references: [id])
  amountCents Int
  status      String  // 'pending' | 'paid'
  period      String  // 'YYYY-MM'
  createdAt   DateTime @default(now())
}

model Tenant {
  id        String   @id @default(cuid())
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  name      String
}
```

### Express server wiring

```ts
// src/server/index.ts
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes, { authMiddleware } from './auth/routes';
import paymentsHistory from './payments/history';
import paymentsReceipt from './payments/receipt';
import paystackWebhook from './payments/webhook';

import subscriptionsRoutes from './subscriptions/routes';
import partnersRoutes from './partners/routes';
import auditRoutes from './audit/routes';
import driversRoutes from './drivers/routes';
import jobsDispatch from './jobs/dispatch';
import jobsUpload from './jobs/upload';
import companyRoutes from './company/routes';
import contractsRoutes from './contracts/routes';
import nationRoutes from './nation/routes';
import federationRoutes from './federation/routes';
import advisorRoutes from './advisor/routes';
import integrationsWebhooks from './integrations/webhooks';
import storeRoutes from './integrations/stores';

import { initRealtime } from './realtime';

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
app.use(helmet());

// Public
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentsHistory);
app.use('/api/payments', paymentsReceipt);
app.use('/api/payments', paystackWebhook);
app.use('/api/integrations', integrationsWebhooks);

// Authenticated
app.use('/api/subscriptions', authMiddleware, subscriptionsRoutes);
app.use('/api/partners', authMiddleware, partnersRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);
app.use('/api/drivers', authMiddleware, driversRoutes);
app.use('/api/jobs', authMiddleware, jobsDispatch);
app.use('/api/jobs', authMiddleware, jobsUpload);
app.use('/api/company', authMiddleware, companyRoutes);
app.use('/api/contracts', authMiddleware, contractsRoutes);
app.use('/api/nation', authMiddleware, nationRoutes);
app.use('/api/federation', authMiddleware, federationRoutes);
app.use('/api/advisor', authMiddleware, advisorRoutes);
app.use('/api/integrations', authMiddleware, storeRoutes);

// HTTP + Socket.io
const httpServer = http.createServer(app);
initRealtime(httpServer);

httpServer.listen(process.env.PORT || 3001);
```

### Auth routes and middleware

```ts
// src/server/auth/routes.ts
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

router.post('/signup', async (req, res) => {
  const { email, password, name, companyName } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const company = await prisma.company.create({ data: { name: companyName } });
  const user = await prisma.user.create({ data: { email, name, role: 'admin', companyId: company.id, passwordHash } });
  const token = jwt.sign({ userId: user.id, companyId: company.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user, company });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, companyId: user.companyId }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

export function authMiddleware(req: any, res: any, next: any) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export default router;
```

### Realtime: Socket.io bridge

```ts
// src/server/realtime.ts
import { Server } from 'socket.io';

export function initRealtime(httpServer: any) {
  const io = new Server(httpServer, { cors: { origin: process.env.FRONTEND_ORIGIN } });

  io.on('connection', (socket) => {
    socket.on('driver:location', (data) => {
      io.emit('dispatch:update', data);
    });
  });

  return io;
}
```

---

## Payments, subscriptions, partners, audit

### Receipt endpoint

```ts
// src/server/payments/receipt.ts
import express from 'express';
import { prisma } from '../prisma';
import { generateReceiptPDF } from './invoice';

const router = express.Router();

router.get('/receipt/:reference', async (req, res) => {
  const p = await prisma.payment.findUnique({ where: { reference: req.params.reference }, include: { company: true } });
  if (!p || p.status !== 'success') return res.status(404).send('Not found');
  const pdfBuffer = generateReceiptPDF({ companyName: p.company?.name || 'Azora Customer', reference: p.reference, amountCents: p.amount });
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdfBuffer));
});

export default router;
```

### Subscriptions routes

```ts
// src/server/subscriptions/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

router.get('/plans', async (_req, res) => {
  res.json({ plans: await prisma.plan.findMany({ where: { active: true }, orderBy: { priceZarCents: 'asc' } }) });
});

router.get('/:companyId', async (req, res) => {
  const sub = await prisma.subscription.findFirst({ where: { companyId: req.params.companyId }, include: { plan: true } });
  res.json({ subscription: sub || null });
});

router.post('/change', async (req, res) => {
  const { companyId, planCode } = req.body;
  const plan = await prisma.plan.findUnique({ where: { code: planCode } });
  if (!plan) return res.status(400).json({ error: 'Invalid plan' });
  const nextEnd = plan.interval === 'monthly' ? new Date(new Date().setMonth(new Date().getMonth() + 1)) : new Date(new Date().setFullYear(new Date().getFullYear() + 1));
  const sub = await prisma.subscription.upsert({
    where: { companyId },
    update: { planId: plan.id, status: 'active', currentPeriodEnd: nextEnd },
    create: { companyId, planId: plan.id, status: 'active', provider: 'paystack', currentPeriodEnd: nextEnd }
  });
  await prisma.company.update({ where: { id: companyId }, data: { subscriptionStatus: 'active' } });
  await writeAudit(companyId, 'subscription', 'change_plan', { planCode });
  res.json({ subscription: sub });
});

router.post('/cancel', async (req, res) => {
  const { companyId } = req.body;
  await prisma.subscription.updateMany({ where: { companyId, status: 'active' }, data: { status: 'canceled' } });
  await prisma.company.update({ where: { id: companyId }, data: { subscriptionStatus: 'canceled' } });
  await writeAudit(companyId, 'subscription', 'cancel', {});
  res.json({ ok: true });
});

export default router;
```

### Partners routes

```ts
// src/server/partners/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

router.get('/summary', async (req, res) => {
  const partnerId = (req.user as any).partnerId;
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  const pending = await prisma.payout.aggregate({ where: { partnerId, status: 'pending' }, _sum: { amountCents: true } });
  const paid = await prisma.payout.aggregate({ where: { partnerId, status: 'paid' }, _sum: { amountCents: true } });
  res.json({ code: partner?.code ?? null, commissionRateBps: partner?.commissionRate ?? 0, pendingCents: pending._sum.amountCents ?? 0, paidCents: paid._sum.amountCents ?? 0 });
});

router.get('/referrals', async (req, res) => {
  const partnerId = (req.user as any).partnerId;
  const referrals = await prisma.referral.findMany({ where: { partnerId }, include: { company: true }, orderBy: { createdAt: 'desc' } });
  res.json({ referrals: referrals.map(r => ({ id: r.id, companyName: r.company.name, createdAt: r.createdAt })) });
});

router.get('/payouts', async (req, res) => {
  const partnerId = (req.user as any).partnerId;
  res.json({ payouts: await prisma.payout.findMany({ where: { partnerId }, orderBy: { createdAt: 'desc' } }) });
});

router.post('/code', async (req, res) => {
  const partnerId = (req.user as any).partnerId;
  const code = `AZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const partner = await prisma.partner.update({ where: { id: partnerId }, data: { code } });
  await writeAudit(partnerId, 'partner', 'refresh_code', { code });
  res.json({ code: partner.code });
});

router.post('/payouts', async (req, res) => {
  const partnerId = (req.user as any).partnerId;
  const { period } = req.body;
  const total = await prisma.payout.aggregate({ where: { partnerId, period, status: 'pending' }, _sum: { amountCents: true } });
  if (!total._sum.amountCents) return res.status(400).json({ error: 'No pending commissions for period' });
  await prisma.payout.updateMany({ where: { partnerId, period, status: 'pending' }, data: { status: 'paid' } });
  await writeAudit(partnerId, 'partner', 'request_payout', { period, amountCents: total._sum.amountCents });
  res.json({ ok: true, period, amountCents: total._sum.amountCents });
});

export default router;
```

### Audit writer and route

```ts
// src/server/audit/write.ts
import { prisma } from '../prisma';
export async function writeAudit(companyId: string, type: string, action: string, meta?: any) {
  await prisma.audit.create({ data: { companyId, type, action, meta } });
}
```

```ts
// src/server/audit/routes.ts
import express from 'express';
import { prisma } from '../prisma';
const router = express.Router();
router.get('/', async (req, res) => {
  const { companyId } = req.query as { companyId: string };
  const audits = await prisma.audit.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 50 });
  res.json({ audits });
});
export default router;
```

---

## Drivers, jobs, integrations

### Drivers routes

```ts
// src/server/drivers/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

router.get('/', async (req, res) => {
  const companyId = (req.user as any).companyId;
  const drivers = await prisma.user.findMany({ where: { companyId, role: 'driver' }, select: { id: true, email: true, name: true } });
  res.json({ drivers });
});

router.post('/', async (req, res) => {
  const companyId = (req.user as any).companyId;
  const { email, name } = req.body;
  const driver = await prisma.user.create({ data: { email, name, role: 'driver', companyId, passwordHash: '' } });
  await writeAudit(companyId, 'driver', 'create', { driverId: driver.id, email });
  res.json({ driver });
});

export default router;
```

### Jobs routes

```ts
// src/server/jobs/dispatch.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

router.get('/', async (req, res) => {
  const companyId = (req.user as any).companyId;
  const jobs = await prisma.job.findMany({ where: { companyId }, orderBy: { updatedAt: 'desc' } });
  res.json({ jobs });
});

router.post('/assign', async (req, res) => {
  const { jobId, driverId } = req.body;
  const job = await prisma.job.update({ where: { id: jobId }, data: { driverId, status: 'assigned' } });
  await writeAudit(job.companyId, 'job', 'assign', { jobId, driverId });
  res.json({ ok: true, job });
});

router.post('/status', async (req, res) => {
  const { jobId, status, tracking } = req.body;
  const job = await prisma.job.update({ where: { id: jobId }, data: { status, tracking } });
  await writeAudit(job.companyId, 'job', 'status', { jobId, status });
  res.json({ ok: true, job });
});

export default router;
```

### Integrations: webhooks and stores

```ts
// src/server/integrations/webhooks.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

router.post('/webhook/:source', async (req, res) => {
  const source = req.params.source;
  const normalized = normalizeEvent(source, req.body);
  if (!normalized) return res.status(400).json({ error: 'Unsupported payload' });

  const { externalRef, companyId, pickup, dropoff, status } = normalized;
  const job = await prisma.job.upsert({
    where: { ref_companyId: { ref: externalRef, companyId } },
    update: { pickup, dropoff, status },
    create: { ref: externalRef, companyId, pickup, dropoff, status: status ?? 'new' }
  });

  await writeAudit(companyId, 'integration', 'job_event', { source, externalRef, status });
  res.json({ ok: true, job });
});

function normalizeEvent(source: string, payload: any) {
  // Adapters for shopify/woocommerce/fastway/dsv/courierguy
  try {
    if (source === 'shopify') {
      const order = payload;
      return {
        externalRef: order.id?.toString(),
        companyId: order.note_attributes?.find((n: any) => n.name === 'companyId')?.value,
        pickup: { address: order.shipping_address?.city || 'Warehouse' },
        dropoff: { address: `${order.shipping_address?.address1}, ${order.shipping_address?.city}` },
        status: 'new'
      };
    }
    if (source === 'woocommerce') {
      const order = payload;
      return {
        externalRef: order.id?.toString(),
        companyId: order.meta_data?.find((m: any) => m.key === 'companyId')?.value,
        pickup: { address: 'Warehouse' },
        dropoff: { address: `${order.shipping?.address_1}, ${order.shipping?.city}` },
        status: 'new'
      };
    }
    const ev = payload; // carriers
    return {
      externalRef: ev.consignRef || ev.waybill || ev.tracking_number,
      companyId: ev.companyId,
      pickup: { address: ev.pickup_address },
      dropoff: { address: ev.dropoff_address },
      status: mapCarrierStatus(ev.status)
    };
  } catch {
    return null;
  }
}

function mapCarrierStatus(s: string) {
  const x = (s || '').toLowerCase();
  if (x.includes('delivered')) return 'delivered';
  if (x.includes('out for delivery') || x.includes('in transit')) return 'in_transit';
  if (x.includes('failed') || x.includes('exception')) return 'failed';
  if (x.includes('assigned') || x.includes('allocated')) return 'assigned';
  return 'new';
}

export default router;
```

---

## Frontend: routing, components, and hooks

### App router and layout

```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';
import { NotificationProvider } from './atomic/NotificationProvider';
import AppRoutes from './AppRoutes';
import PWAInstallPrompt from './components/azora/PWAInstallPrompt';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
          <PWAInstallPrompt />
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
```

```tsx
// src/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainDashboard from './pages/MainDashboard';
import LedgerPage from './pages/LedgerPage';
import ContractsPage from './pages/ContractsPage';
import ProfilePage from './pages/ProfilePage';
import NationPage from './pages/NationPage';
import FederationPage from './pages/FederationPage';
import AdvisorPage from './pages/AdvisorPage';
import Jobs from './pages/Jobs';
import DispatchPage from './pages/DispatchPage';
import DriversAdmin from './pages/DriversAdmin';
import DriverPage from './pages/Driver';
import SubscriptionPage from './pages/Subscription';
import PartnerDashboard from './pages/PartnerDashboard';
import Billing from './pages/Billing';
import Settings from './pages/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainDashboard />} />
      <Route path="/ledger" element={<LedgerPage />} />
      <Route path="/contracts" element={<ContractsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/nation" element={<NationPage />} />
      <Route path="/federation" element={<FederationPage />} />
      <Route path="/advisor" element={<AdvisorPage />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/dispatch" element={<DispatchPage />} />
      <Route path="/drivers" element={<DriversAdmin />} />
      <Route path="/driver" element={<DriverPage driverId="driver_demo" />} />
      <Route path="/subscription" element={<SubscriptionPage companyId="demo_company" />} />
      <Route path="/partners" element={<PartnerDashboard />} />
      <Route path="/billing" element={<Billing companyId="demo_company" />} />
      <Route path="/settings" element={<Settings companyId="demo_company" />} />
    </Routes>
  );
}
```

### Shared API hook

```tsx
// src/hooks/useApi.ts
import { useEffect, useState } from 'react';

export function useApi<T = any>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url, options)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((json) => !cancelled && setData(json))
      .catch((err) => !cancelled && setError(err.message || 'Unknown error'))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}
```

### Sidebar responsive with theme toggle

```tsx
// src/components/azora/Sidebar.tsx
import React, { useState } from 'react';
import { Zap, Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import GlassPanel from './atoms/GlassPanel';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Ledger', href: '/ledger' },
  { label: 'Contracts', href: '/contracts' },
  { label: 'Profile', href: '/profile' },
  { label: 'Nation', href: '/nation' },
  { label: 'Federation', href: '/federation' },
  { label: 'Advisor', href: '/advisor' },
  { label: 'Dispatch', href: '/dispatch' },
  { label: 'Drivers', href: '/drivers' },
  { label: 'Subscription', href: '/subscription' },
  { label: 'Partners', href: '/partners' },
  { label: 'Billing', href: '/billing' },
  { label: 'Settings', href: '/settings' }
];

export default function Sidebar({ isOpen = false }: { isOpen?: boolean }) {
  const [open, setOpen] = useState(isOpen);
  return (
    <>
      <button className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded bg-cyan-600 text-white" onClick={() => setOpen(!open)}>
        <Menu className="w-6 h-6" />
      </button>
      <div className={`fixed lg:relative top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <GlassPanel className="w-64 h-full flex-shrink-0 p-5 flex flex-col">
          <div className="flex items-center mb-6">
            <Zap className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white ml-2">Azora</h1>
          </div>
          <nav className="flex flex-col gap-2 text-white/80">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) => `p-2 rounded-lg transition-colors ${isActive ? 'bg-cyan-600 text-white' : 'hover:bg-white/10'}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex items-center justify-between">
            <p className="text-xs text-white/40">AzoraOS v2.3-atomic</p>
            <ThemeToggle />
          </div>
        </GlassPanel>
      </div>
    </>
  );
}
```

### Live tracking map and driver app (WebSocket)

```tsx
// src/components/azora/TrackingMap.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

type DriverPoint = { driverId: string; lat: number; lon: number; status?: string; updatedAt?: number };
const socket = io();

export default function TrackingMap() {
  const [drivers, setDrivers] = useState<DriverPoint[]>([]);
  useEffect(() => {
    socket.on('dispatch:update', (data: DriverPoint) => {
      setDrivers((prev) => [...prev.filter((d) => d.driverId !== data.driverId), { ...data, updatedAt: Date.now() }]);
    });
    return () => { socket.off('dispatch:update'); };
  }, []);
  return (
    <div className="h-96 w-full">
      <MapContainer center={[-29.85, 31.02]} zoom={6} className="h-full w-full rounded">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {drivers.map((d) => (
          <Marker key={d.driverId} position={[d.lat, d.lon]}>
            <Popup>
              <div className="text-sm">
                <div><strong>Driver:</strong> {d.driverId}</div>
                <div><strong>Status:</strong> {d.status || 'unknown'}</div>
                <div><strong>Updated:</strong> {d.updatedAt ? new Date(d.updatedAt).toLocaleTimeString('en-ZA') : '-'}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

```tsx
// src/pages/Driver.tsx
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
const socket = io();

export default function DriverPage({ driverId }: { driverId: string }) {
  const [geoError, setGeoError] = useState<string | null>(null);
  useEffect(() => {
    const send = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoError(null);
          socket.emit('driver:location', { driverId, lat: pos.coords.latitude, lon: pos.coords.longitude, status: 'in_transit' });
        },
        (err) => setGeoError(err.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    };
    send();
    const id = setInterval(send, 15000);
    return () => clearInterval(id);
  }, [driverId]);
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-3">Driver console</h1>
      {geoError && <div className="mb-2 text-yellow-700">Location issue: {geoError}</div>}
      <div className="text-sm text-gray-600">GPS updates every 15 seconds. Keep the app open while on route.</div>
    </div>
  );
}
```

### PWA install prompt

```tsx
// src/components/azora/PWAInstallPrompt.tsx
import React, { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); setVisible(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={handleInstall} className="px-4 py-2 bg-cyan-600 text-white rounded shadow-lg hover:bg-cyan-700">
        Install Azora OS
      </button>
    </div>
  );
}
```

---

## Legal, localization, and settings

### Company settings route and page

```ts
// src/server/company/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';
const router = express.Router();

router.get('/:companyId', async (req, res) => {
  const company = await prisma.company.findUnique({ where: { id: req.params.companyId } });
  res.json(company);
});

router.post('/update', async (req, res) => {
  const { companyId, name, vatNumber, vatPercent, billingEmail, popiaConsent } = req.body;
  const company = await prisma.company.update({ where: { id: companyId }, data: { name, vatNumber, vatPercent, billingEmail, popiaConsent } });
  await writeAudit(companyId, 'settings', 'update_company', { name, vatNumber, vatPercent, popiaConsent });
  res.json({ company });
});

export default router;
```

```tsx
// src/pages/Settings.tsx
import React, { useEffect, useState } from 'react';

export default function Settings({ companyId }: { companyId: string }) {
  const [name, setName] = useState(''); const [vatNumber, setVatNumber] = useState('');
  const [vatPercent, setVatPercent] = useState(15); const [billingEmail, setBillingEmail] = useState('');
  const [popiaConsent, setPopiaConsent] = useState(false);

  useEffect(() => {
    fetch(`/api/company/${companyId}`).then(async (res) => {
      const c = await res.json();
      setName(c.name || ''); setVatNumber(c.vatNumber || ''); setVatPercent(c.vatPercent || 15);
      setBillingEmail(c.billingEmail || ''); setPopiaConsent(!!c.popiaConsent);
    });
  }, [companyId]);

  async function save() {
    await fetch('/api/company/update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, name, vatNumber, vatPercent, billingEmail, popiaConsent })
    });
  }

  return (
    <div className="p-6 space-y-3 max-w-md">
      <h1 className="text-xl font-bold mb-4">Company Settings</h1>
      <label className="block"><span className="text-sm">Company name</span>
        <input className="mt-1 border px-2 py-1 w-full rounded" value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label className="block"><span className="text-sm">VAT number</span>
        <input className="mt-1 border px-2 py-1 w-full rounded" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} /></label>
      <label className="block"><span className="text-sm">VAT percent</span>
        <input type="number" className="mt-1 border px-2 py-1 w-full rounded" value={vatPercent} onChange={(e) => setVatPercent(+e.target.value)} /></label>
      <label className="block"><span className="text-sm">Billing email</span>
        <input className="mt-1 border px-2 py-1 w-full rounded" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} /></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={popiaConsent} onChange={(e) => setPopiaConsent(e.target.checked)} />
        <span className="text-sm">POPIA consent</span></label>
      <button onClick={save} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Save</button>
    </div>
  );
}
```

---

## Deployment, ops, and compliance

- **Secrets:**
  - **PAYSTACK_SECRET_KEY** (server), **REACT_APP_PAYSTACK_PUBLIC_KEY** (client)
  - **JWT_SECRET**, database URL
- **Security:**
  - **CORS:** set `FRONTEND_ORIGIN`
  - **HTTPS:** enforce in prod
  - **Webhook signatures:** validate Paystack
- **Monitoring:**
  - **Error tracking:** Sentry or similar
  - **Audit logging:** payments, jobs, settings, partners, subscriptions
- **Cron:**
  - Monthly commission accrual for partners
- **Legal & Localization:**
  - Terms, Privacy Policy, POPIA notice pages
  - ZAR and 15% VAT defaults; dates via `en-ZA`

---

## Your next actions

- **Run migrations:** update Prisma schema, `prisma migrate dev`
- **Wire env vars:** `.env` for secrets and origins, tell me which vars my code is using.
- **Start end-to-end test:** signup → payment → receipt → activation → jobs → driver GPS → dispatcher map → ledger → partner payout → audit logs

---
