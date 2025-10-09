// src/server/cron.ts
import cron from 'node-cron';
import { accrueMonthly } from './partners/accrual';

cron.schedule('0 2 1 * *', async () => { // 02:00 on day 1 monthly
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
  await accrueMonthly(period);
});
