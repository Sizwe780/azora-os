import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import cron from 'node-cron';
import { connectDB } from './config/database';
import swaggerSpec from './config/swagger';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { metricsMiddleware } from './middleware/metrics';
import creditRoutes from './routes/creditRoutes';
import trustRoutes from './routes/trustRoutes';
import repaymentRoutes from './routes/repaymentRoutes';
import healthRoutes from './routes/healthRoutes';
import { startCreditScheduler } from './services/creditScheduler';

const app = express();
const PORT = process.env.PORT || 3006;

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Metrics
app.use(metricsMiddleware);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/credit', creditRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api/repayment', repaymentRoutes);
app.use('/api/health', healthRoutes);

// Error handling
app.use(errorHandler);

// Start credit processing scheduler
startCreditScheduler();

// Start server
app.listen(PORT, () => {
  console.log(`Azora Mint service running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});