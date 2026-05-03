import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import config from './prisma.config.ts';

try {
  const prisma = new PrismaClient(config);
  console.log("Success with config");
} catch (e) {
  console.error(e.message);
}
