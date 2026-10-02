import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth/youtube(.*)',
  '/auth/social(.*)',
  '/talking-points(.*)',
  '/api/auth/youtube(.*)',
  '/api/auth/social(.*)',
  '/api/og(.*)',
  '/api/public(.*)',
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
