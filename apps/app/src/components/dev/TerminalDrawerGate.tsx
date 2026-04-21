'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const TerminalDrawer = dynamic(
  async () => (await import('@/components/dev/TerminalDrawer')).TerminalDrawer,
  { ssr: false },
);

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
