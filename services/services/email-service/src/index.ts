import 'dotenv/config';
import { EmailService } from './emailService';

const PORT = parseInt(process.env.PORT || '3000');

const emailService = new EmailService();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await emailService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await emailService.close();
  process.exit(0);
});

emailService.start(PORT);