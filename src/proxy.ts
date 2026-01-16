import { auth } from "@/lib/auth/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
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

  // Subdomain routing (existing Phase 1 logic)
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

  // Subdomain detected - rewrite to tenant route
  if (subdomain) {
    return NextResponse.rewrite(new URL(`/${subdomain}${nextUrl.pathname}`, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match all paths except static files, api/auth, and Next.js internals
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}
