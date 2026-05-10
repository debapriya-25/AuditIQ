import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Sanitize sensitive fields globally to prevent PII leakage
const redactPaths = [
  'email',
  'companyName',
  'role',
  'req.headers.authorization',
  'password',
  'token',
  'apiKey',
  '*.email',
  '*.companyName',
];

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  redact: redactPaths,
  // Base configuration ensures structured logs work well in serverless execution
  base: {
    env: process.env.NODE_ENV,
  },
  formatters: {
    level: (label) => {
      // Formats the level as a string instead of a number for better log ingestion compatibility
      return { level: label }; 
    },
  },
  // In production, Pino logs raw JSON directly to stdout for Vercel to ingest
  // In development, Pino-pretty makes it readable in the terminal
  ...(!isProduction && { transport: { target: 'pino-pretty', options: { colorize: true } } }),
});
