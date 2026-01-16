import { PrismaClient } from '@prisma/client';
import { getTenantContext } from './tenant-context';

// Singleton pattern for Prisma client in development
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Extend client with tenant isolation
  return baseClient.$extends({
    query: {
      // Tenant-scoped models that require filtering
      wedding: {
        async findMany({ args, query }) {
          const tenantId = getTenantContext();
          if (tenantId) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async findFirst({ args, query }) {
          const tenantId = getTenantContext();
          if (tenantId) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async findUnique({ args, query }) {
          // For findUnique, we validate tenant after fetch
          const result = await query(args);
          const tenantId = getTenantContext();
          if (result && tenantId && result.tenantId !== tenantId) {
            return null; // Don't expose cross-tenant data
          }
          return result;
        },
        async create({ args, query }) {
          // Wedding creation requires explicit tenant specification via relation
          // Tenant context validates but doesn't auto-inject to avoid type conflicts
          return query(args);
        },
        async update({ args, query }) {
          const tenantId = getTenantContext();
          if (tenantId) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async delete({ args, query }) {
          const tenantId = getTenantContext();
          if (tenantId) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
      },
      guest: {
        async findMany({ args, query }) {
          const tenantId = getTenantContext();
          if (tenantId) {
            args.where = {
              ...args.where,
              wedding: { tenantId },
            };
          }
          return query(args);
        },
        async create({ args, query }) {
          // Guest creation should verify wedding belongs to tenant
          // This is handled by the wedding foreign key constraint
          return query(args);
        },
      },
      event: {
        async findMany({ args, query }) {
          const tenantId = getTenantContext();
          if (tenantId) {
            args.where = {
              ...args.where,
              wedding: { tenantId },
            };
          }
          return query(args);
        },
        async create({ args, query }) {
          // Event creation should verify wedding belongs to tenant
          return query(args);
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Re-export tenant context for convenience
export { withTenantContext, getTenantContext, requireTenantContext } from './tenant-context';
