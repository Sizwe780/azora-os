# Azora Portal Backend

Backend service for azora.world portal providing API endpoints for contact forms, newsletter signups, and basic portal functionality.

## Features

- Contact form submission with email notifications
- Newsletter signup management
- Health check endpoints
- PostgreSQL database with Prisma ORM
- Rate limiting and security middleware
- Input validation with Joi

## Tech Stack

- Node.js with Express
- PostgreSQL with Prisma ORM
- Joi for validation
- Nodemailer for email notifications
- Helmet for security headers
- CORS support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Contact Form
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get contact submissions (admin)
- `PUT /api/contact/:id/status` - Update submission status (admin)

### Newsletter
- `POST /api/newsletter` - Subscribe to newsletter
- `DELETE /api/newsletter` - Unsubscribe from newsletter
- `GET /api/newsletter/stats` - Get newsletter statistics (admin)

### Health
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check with metrics

## Database Schema

- `ContactSubmission` - Stores contact form submissions
- `NewsletterSignup` - Manages newsletter subscriptions
- `UserPreference` - User preferences (future use)

## Environment Variables

See `.env.example` for required configuration variables.

## Development

```bash
# Run tests
npm test

# Run in production mode
npm start

# Database operations
npx prisma studio  # Open Prisma Studio
npx prisma migrate dev  # Run migrations
```

## Security

- Rate limiting on all API endpoints
- Input validation and sanitization
- CORS configuration
- Security headers via Helmet
- POPIA compliant data handling

## Deployment

The service is designed to run in Docker containers and can be deployed to services like Railway, Render, or Vercel.

## License

This project is licensed under the AZORA PROPRIETARY LICENSE - see the LICENSE file for details.

Copyright Azora ES (Pty) Ltd