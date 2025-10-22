/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/


import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config();

import { DatabaseManager, DB_CONFIG } from './dbManager.js';
import AnalyticsEngine from './analyticsEngine.js';
import CacheEngine from './cacheEngine.js';
import SyncEngine from './syncEngine.js';

const app = express();
const PORT = process.env.DATABASE_PORT || 5002;

const dbManager = new DatabaseManager();
const analytics = new AnalyticsEngine(dbManager);
const cache = new CacheEngine(dbManager);
const sync = new SyncEngine(dbManager);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ...existing endpoint code from index.js...

app.listen(PORT, () => {
	console.log(`🗄️  Database & Analytics Integration Service online on port ${PORT}`);
});

export { dbManager, analytics, cache, sync, DB_CONFIG };
export default app;
