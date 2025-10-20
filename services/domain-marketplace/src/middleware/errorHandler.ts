import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Log error
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    service: 'domain-marketplace'
  });

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  // Mongoose duplicate key error
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}