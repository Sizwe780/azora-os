/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import 'dotenv/config';
import { MessagingService } from './messagingService';

const PORT = parseInt(process.env.PORT || '4200');

const messagingService = new MessagingService();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await messagingService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await messagingService.close();
  process.exit(0);
});

messagingService.start(PORT);