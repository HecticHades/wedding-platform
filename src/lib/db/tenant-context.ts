import { AsyncLocalStorage } from 'async_hooks';

// Tenant context stored in AsyncLocalStorage for request-scoped isolation
const tenantStorage = new AsyncLocalStorage<string>();

/**
 * Execute a function with a specific tenant context.
 * All database operations within the function will be scoped to this tenant.
 */
export function withTenantContext<T>(tenantId: string, fn: () => T): T {
  return tenantStorage.run(tenantId, fn);
}

/**
 * Get the current tenant ID from context.
 * Returns undefined if not within a tenant context.
 */
export function getTenantContext(): string | undefined {
  return tenantStorage.getStore();
}

/**
 * Require tenant context - throws if not set.
 * Use this when tenant context is mandatory.
 */
export function requireTenantContext(): string {
  const tenantId = getTenantContext();
  if (!tenantId) {
    throw new Error('Tenant context is required but not set');
  }
  return tenantId;
}
