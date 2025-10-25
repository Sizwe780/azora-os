/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3005,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/azora_mint'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  environment: process.env.NODE_ENV || 'development'
};