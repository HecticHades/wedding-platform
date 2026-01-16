import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    // Match all paths except static files, api routes, and Next.js internals
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Define root domain (supports localhost for development)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // Extract subdomain
  let subdomain: string | null = null;

  // Production: alice-bob.weddingplatform.com -> alice-bob
  if (hostname.endsWith(`.${rootDomain}`) && !hostname.startsWith('www.')) {
    subdomain = hostname.replace(`.${rootDomain}`, '');
  }

  // Development: alice-bob.localhost:3000 -> alice-bob
  if (hostname.includes('localhost') && hostname !== 'localhost:3000' && hostname !== 'localhost') {
    subdomain = hostname.split('.')[0];
  }

  // No subdomain = main platform site
  if (!subdomain) {
    return NextResponse.next();
  }

  // Rewrite to dynamic [domain] route
  const newUrl = new URL(`/${subdomain}${url.pathname}`, req.url);
  return NextResponse.rewrite(newUrl);
}
