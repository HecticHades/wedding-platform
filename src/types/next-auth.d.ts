import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "admin" | "couple"
      tenantId: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: "admin" | "couple"
    tenantId: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: "admin" | "couple"
    tenantId: string | null
  }
}
