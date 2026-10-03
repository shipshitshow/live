import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  classifyPath,
  evaluateProducerAccess,
  PRODUCERS_ONLY_PATH,
  producerDenial,
  SIGN_IN_PATH,
} from '@/lib/producer-access';

export default clerkMiddleware(async (auth, req) => {
  if (classifyPath(req.nextUrl.pathname) === 'public') return;
  const access = evaluateProducerAccess((await auth()).userId);
  if (access.ok) return;

  if (req.nextUrl.pathname.startsWith('/api/')) {
    const { code, error, status } = producerDenial(access.reason);
    return NextResponse.json(
      { code, error },
      { headers: { 'Cache-Control': 'no-store' }, status },
    );
  }

  const redirectUrl = new URL(
    access.reason === 'signed_out' ? SIGN_IN_PATH : PRODUCERS_ONLY_PATH,
    req.url,
  );
  if (access.reason === 'signed_out') {
    redirectUrl.searchParams.set('redirect_url', req.url);
  }
  return NextResponse.redirect(redirectUrl, 307);
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
};
