import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

import { verifyPassword } from "./password"
import { authConfig } from "./auth.config"

// Create a raw Prisma client for auth operations (no tenant context)
// Auth operations are platform-level, not tenant-scoped
const prisma = new PrismaClient()

const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials format
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) {
          return null
        }

        const { email, password } = parsed.data

        // Find user by email (platform-level, no tenant context)
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.hashedPassword) {
          return null
        }

        // Verify password
        const isValid = await verifyPassword(password, user.hashedPassword)
        if (!isValid) {
          return null
        }

        // Return user object with role and tenantId
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as "admin" | "couple",
          tenantId: user.tenantId,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // Copy role and tenantId from user to token on sign-in
      if (user) {
        token.role = user.role
        token.tenantId = user.tenantId
      }
      return token
    },
    async session({ session, token }) {
      // Copy id, role, tenantId from token to session.user
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role
        session.user.tenantId = token.tenantId
      }
      return session
    },
  },
})
