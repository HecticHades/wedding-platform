import { Vercel } from "@vercel/sdk"

// Singleton Vercel client
// Note: @vercel/sdk is ESM-only
export const vercel = new Vercel({
  bearerToken: process.env.VERCEL_API_TOKEN!,
})

// Configuration from environment
export const vercelConfig = {
  projectId: process.env.VERCEL_PROJECT_ID!,
  teamId: process.env.VERCEL_TEAM_ID || undefined, // Optional for personal accounts
}
