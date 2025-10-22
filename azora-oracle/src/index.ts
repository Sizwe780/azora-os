/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import 'dotenv/config';
import { ChamberOfGhostsService } from './chamberOfGhostsService';

const PORT = parseInt(process.env.PORT || '3005');

const chamberService = new ChamberOfGhostsService();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down Chamber of Ghosts gracefully');
  await chamberService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down Chamber of Ghosts gracefully');
  await chamberService.close();
  process.exit(0);
});

chamberService.start(PORT);