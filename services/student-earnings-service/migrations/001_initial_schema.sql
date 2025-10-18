-- Student Earnings Database Initial Schema
-- Run this manually if needed: psql -U student_earnings_user -d student_earnings_db -f migrations/001_initial_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- This schema is automatically applied by database.js initializeDatabase()
-- This file serves as documentation and manual migration reference

SELECT 'Student Earnings Database Schema Ready' AS status;