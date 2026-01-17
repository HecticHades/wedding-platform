import { auth } from "@/lib/auth/auth"
import { NextResponse } from "next/server"

// Internal API secret for secure middleware-to-API communication
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "default-internal-secret-change-in-production"

// Validate subdomain format: alphanumeric and hyphens only, 1-63 chars
const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i

function isValidSubdomain(subdomain: string): boolean {
  return SUBDOMAIN_REGEX.test(subdomain) && subdomain.length <= 63
}

export default auth(async (req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === "admin"

  // Auth route protection
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl.origin))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin))
    }
  }

  if (nextUrl.pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl.origin))
    }
    // Admin trying to access dashboard goes to admin
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin", nextUrl.origin))
    }
  }

  // Redirect logged-in users away from login page
  if (nextUrl.pathname === "/login" && isLoggedIn) {
    const redirectTo = isAdmin ? "/admin" : "/dashboard"
    return NextResponse.redirect(new URL(redirectTo, nextUrl.origin))
  }

  // Hostname-based routing (subdomain or custom domain)
  const hostname = req.headers.get("host") || ""
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"

  let subdomain: string | null = null

  // Production: alice-bob.weddingplatform.com -> alice-bob
  if (hostname.endsWith(`.${rootDomain}`) && !hostname.startsWith("www.")) {
    subdomain = hostname.replace(`.${rootDomain}`, "")
  }

  // Development: alice-bob.localhost:3000 -> alice-bob
  if (hostname.includes("localhost") && hostname !== "localhost:3000" && hostname !== "localhost") {
    subdomain = hostname.split(".")[0]
  }

  // Subdomain detected - validate and rewrite to tenant route
  if (subdomain) {
    // Security: Validate subdomain format to prevent path traversal
    if (!isValidSubdomain(subdomain)) {
      console.warn(`Invalid subdomain format rejected: ${subdomain}`)
      return NextResponse.redirect(new URL("/", nextUrl.origin))
    }
    return NextResponse.rewrite(new URL(`/${subdomain}${nextUrl.pathname}`, req.url))
  }

  // Check for custom domain (not subdomain, not root, not localhost dev)
  const isCustomDomain =
    !hostname.endsWith(`.${rootDomain}`) &&
    hostname !== rootDomain &&
    !hostname.includes("localhost") &&
    !hostname.startsWith("www.")

  if (isCustomDomain) {
    try {
      // Lookup tenant by custom domain via internal API
      // We use fetch because middleware runs in Edge runtime and cannot use Prisma directly
      const lookupUrl = new URL("/api/internal/tenant-lookup", req.url)
      lookupUrl.searchParams.set("domain", hostname)

      const response = await fetch(lookupUrl.toString(), {
        headers: {
          "x-internal-secret": INTERNAL_API_SECRET,
        },
      })
      const data = await response.json()

      if (data.tenant?.subdomain && isValidSubdomain(data.tenant.subdomain)) {
        // Rewrite to tenant route using their subdomain
        return NextResponse.rewrite(
          new URL(`/${data.tenant.subdomain}${nextUrl.pathname}`, req.url)
        )
      }

      // Custom domain not found or not verified - show error page
      console.warn(`Custom domain not found or not verified: ${hostname}`)
    } catch (error) {
      console.error("Custom domain lookup failed:", error)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match all paths except static files, api/auth, api/internal, and Next.js internals
    "/((?!api/auth|api/internal|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}
