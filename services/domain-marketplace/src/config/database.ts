import mongoose from 'mongoose';
import logger from '../utils/logger';

export async function connectDB(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/domain-marketplace';

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('Connected to MongoDB', {
      service: 'domain-marketplace',
      database: mongoUri.split('/').pop()
    });

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    } else {
      // If db is not available, check connection state
      return mongoose.connection.readyState === 1;
    }
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}