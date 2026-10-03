import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/talking-points(.*)',
  '/api/og(.*)',
  '/api/public(.*)',
  '/api/producer/access',
  '/producers-only',
]);

export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname === '/' || isPublicRoute(req)) {
    return;
  }

  await auth.protect({
    unauthenticatedUrl: new URL('/sign-in', req.url).toString(),
  });
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
};
