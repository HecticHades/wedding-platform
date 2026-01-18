/**
 * URL utilities for generating tenant URLs in both development and production environments.
 * Uses NEXT_PUBLIC_ROOT_DOMAIN to switch between localhost:3000 and production domain.
 */

/**
 * Get the root domain from environment variable.
 * Defaults to localhost:3000 for local development.
 * Strips protocol and trailing slashes if present.
 */
export function getRootDomain(): string {
  let domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  // Strip protocol if present
  domain = domain.replace(/^https?:\/\//, "");
  // Strip trailing slashes
  domain = domain.replace(/\/+$/, "");
  return domain;
}

/**
 * Generate a full URL for a tenant subdomain with optional path.
 * Automatically uses http for localhost and https for production.
 *
 * @param subdomain - The tenant's subdomain (e.g., "john-and-jane")
 * @param path - Optional path to append (should start with "/" if provided)
 * @returns Full URL (e.g., "https://john-and-jane.wedding-platform-fawn.vercel.app/rsvp")
 */
export function getTenantUrl(subdomain: string, path: string = ""): string {
  const rootDomain = getRootDomain();
  const isLocalhost = rootDomain.includes("localhost");
  const protocol = isLocalhost ? "http" : "https";
  return `${protocol}://${subdomain}.${rootDomain}${path}`;
}

/**
 * Generate a display-friendly URL without protocol.
 * Used for showing URLs in UI without the http(s):// prefix.
 *
 * @param subdomain - The tenant's subdomain
 * @param path - Optional path to append
 * @returns Display URL (e.g., "john-and-jane.wedding-platform-fawn.vercel.app/rsvp")
 */
export function getTenantUrlDisplay(subdomain: string, path: string = ""): string {
  return `${subdomain}.${getRootDomain()}${path}`;
}
