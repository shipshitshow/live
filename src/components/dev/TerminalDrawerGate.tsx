'use client';

import { usePathname } from 'next/navigation';
import { TerminalDrawer } from '@/components/dev/TerminalDrawer';

function shouldHideTerminal(pathname: string | null): boolean {
  if (!pathname) return false;
  return /^\/livestream\/[^/]+$/.test(pathname);
}

export function TerminalDrawerGate() {
  const pathname = usePathname();

  if (shouldHideTerminal(pathname)) {
    return null;
  }

  return <TerminalDrawer />;
}
