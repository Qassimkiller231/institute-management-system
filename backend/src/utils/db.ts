import { PrismaClient } from '@prisma/client';
import { isProduction } from '../config/env';
// this is a singleton for the prisma connection, so that all services use one connection
const prisma = new PrismaClient({
  // Verbose query logging in dev only; production logs errors/warnings only
  // (avoids log spam and keeps query parameters / PII out of prod logs).
  log: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
});

export default prisma;
