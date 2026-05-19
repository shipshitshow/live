export interface MarkdownSection {
  body: string;
  title: string;
}

export function parseSections(content: string): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  const matches = Array.from(content.matchAll(/^## (.+)$/gm));

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const next = matches[i + 1];
    const title = match[1].trim();
    const body = content
      .slice((match.index ?? 0) + match[0].length, next?.index)
      .trim();

    if (body.length > 0) sections.push({ body, title });
  }

  return sections;
}

export function parseSubSections(body: string): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  const matches = Array.from(body.matchAll(/^### (.+)$/gm));

  if (matches.length === 0) return [{ body, title: '' }];

  const preamble = body.slice(0, matches[0].index).trim();
  if (preamble) sections.push({ body: preamble, title: '' });

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const next = matches[i + 1];
    const title = match[1].trim();
    const sectionBody = body
      .slice((match.index ?? 0) + match[0].length, next?.index)
      .trim();
    if (sectionBody.length > 0) sections.push({ body: sectionBody, title });
  }

  return sections;
}

export function isUsefulSection(title: string): boolean {
  const normalized = title.toLowerCase();
  return (
    normalized === 'summary' ||
    normalized === 'hot take' ||
    normalized.startsWith('cold open') ||
    normalized.startsWith('talking points') ||
    normalized.startsWith('close') ||
    normalized.startsWith('tweets') ||
    normalized.startsWith('sources')
  );
}

export function extractTweetIds(body: string): string[] {
  const matches = body.matchAll(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/g);
  return Array.from(new Set(Array.from(matches, (m) => m[1])));
}

export function extractYouTubeVideoIds(body: string): string[] {
  const matches = body.matchAll(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/g,
  );
  return Array.from(new Set(Array.from(matches, (m) => m[1])));
}

export function stripEmbedUrls(body: string): string {
  return body
    .replace(/https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/\d+/g, '')
    .replace(
      /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}[^\s)"]*/g,
      '',
    );
}

function renderAutoLinkedText(text: string, keyPrefix: string) {
  const urlPattern = /(https?:\/\/[^\s),]+)/g;
  const segments = text.split(urlPattern);
  return segments.map((seg, i) => {
    if (/^https?:\/\//.test(seg)) {
      const display = seg
        .replace(/^https?:\/\/(?:www\.)?/, '')
        .replace(/\/$/, '');
      return (
        <a
          key={`${keyPrefix}-url-${i}`}
          href={seg}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-red hover:underline break-all"
        >
          {display}
        </a>
      );
    }
    return seg;
  });
}

export function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-red hover:underline"
        >
          {linkMatch[1]}
        </a>
      );
    }

    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) return <strong key={index}>{boldMatch[1]}</strong>;

    const codeMatch = part.match(/^`(.*?)`$/);
    if (codeMatch) {
      return (
        <code key={index} className="rounded bg-surface-elevated px-1 py-0.5">
          {codeMatch[1]}
        </code>
      );
    }

    return <span key={index}>{renderAutoLinkedText(part, String(index))}</span>;
  });
}

export function MarkdownBody({
  body,
  large,
}: {
  body: string;
  large?: boolean;
}) {
  const lines = body.split('\n').filter((line) => {
    const t = line.trim();
    return t.length > 0 && t !== '>';
  });
  const textSize = large ? 'text-lg' : 'text-sm';
  const leading = large ? 'leading-[1.8]' : 'leading-relaxed';

  return (
    <div className={large ? 'space-y-4' : 'space-y-2.5'}>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        const bullet = trimmed.match(/^-+\s+(.+)$/);
        const quote = trimmed.match(/^>\s?(.+)$/);
        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);

        if (headingMatch) {
          const level = headingMatch[1].length;
          const headingClass =
            level <= 3
              ? `text-base font-semibold ${leading} text-text-primary`
              : level === 4
                ? `text-sm font-semibold ${leading} text-text-secondary`
                : `text-sm font-medium ${leading} text-text-muted`;
          return (
            <p key={`${index}-${trimmed}`} className={headingClass}>
              {renderInlineMarkdown(headingMatch[2])}
            </p>
          );
        }

        if (bullet) {
          return (
            <p
              key={`${index}-${trimmed}`}
              className={`pl-5 ${textSize} ${leading} text-text-secondary before:-ml-5 before:mr-2 before:text-accent-red before:content-['-']`}
            >
              {renderInlineMarkdown(bullet[1])}
            </p>
          );
        }

        if (quote) {
          return (
            <blockquote
              key={`${index}-${trimmed}`}
              className={`border-l-2 border-accent-red/50 pl-4 ${textSize} ${leading} text-text-primary`}
            >
              {renderInlineMarkdown(quote[1])}
            </blockquote>
          );
        }

        return (
          <p
            key={`${index}-${trimmed}`}
            className={`${textSize} ${leading} text-text-secondary`}
          >
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
