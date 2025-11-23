// backend/prisma.config.ts
import { defineConfig, env } from 'prisma/config';
import { config } from "dotenv";
 config();
export default defineConfig({
  // Path to your schema
  schema: 'prisma/schema.prisma',

  // Where migrations will be stored
  migrations: {
    path: 'prisma/migrations',
  },

  // 👇 REQUIRED: tell Prisma which env var holds the DB URL
  datasource: {
    url: env('DATABASE_URL'),
  },

  // Optional, but fine if you want the classic engine
  engine: 'classic',
});