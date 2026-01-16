import type { NextAuthConfig } from "next-auth"

/**
 * Auth.js edge-compatible configuration.
 * This file contains no Prisma imports to remain compatible with Edge runtime.
 * Full configuration with providers is in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdmin = auth?.user?.role === "admin"

      // Admin routes require admin role
      if (nextUrl.pathname.startsWith("/admin")) {
        return isAdmin
      }

      // Dashboard requires login
      if (nextUrl.pathname.startsWith("/dashboard")) {
        return isLoggedIn
      }

      return true
    },
  },
  providers: [], // Providers added in full auth.ts
}
