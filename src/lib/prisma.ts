import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for PostgreSQL (e.g. Supabase)');
  }
  // Vercel serverless 需使用连接池，添加 ?pgbouncer=true 禁用 prepared statements
  const poolerUrl = connectionString.includes('pgbouncer=true')
    ? connectionString
    : `${connectionString}${connectionString.includes('?') ? '&' : '?'}pgbouncer=true`;
  const adapter = new PrismaPg({
    connectionString: poolerUrl,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  // @ts-expect-error - globalThis.prisma 用于 dev 热重载避免重复创建连接
  globalThis.prisma = prisma;
}
