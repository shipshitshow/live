import Link from "next/link";

export interface AppHeaderLink {
  href: string;
  label: string;
}

export const PRIMARY_HEADER_LINKS: AppHeaderLink[] = [
  { href: "/", label: "Analytics" },
  { href: "/comments", label: "Comments" },
  { href: "/review", label: "Unpublished" },
  { href: "/livestream", label: "Livestream" },
  { href: "/trends", label: "Trends" },
];

interface AppHeaderProps {
  subtitle: string;
  activeHref: string;
  links?: AppHeaderLink[];
}

export function AppHeader({
  subtitle,
  activeHref,
  links = PRIMARY_HEADER_LINKS,
}: AppHeaderProps) {
  return (
    <header className="border-b border-surface-border px-6 py-4 flex items-center justify-between gap-6">
      <Link href="/" className="flex items-center gap-3 min-w-0 hover:opacity-90 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81z" />
            <path d="M9.75 15.02V8.98L15.5 12l-5.75 3.02z" fill="#ff2d20" />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-text-primary leading-none">Ship Shit Show</h1>
          <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>
        </div>
      </Link>
      <nav className="flex items-center gap-4 text-xs text-text-secondary shrink-0">
        {links.map((link) =>
          link.href === activeHref ? (
            <span key={link.href} className="text-text-primary font-medium">
              {link.label}
            </span>
          ) : (
            <Link key={link.href} href={link.href} className="hover:text-text-primary transition-colors">
              {link.label}
            </Link>
          )
        )}
      </nav>
    </header>
  );
}
