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
    normalized.startsWith('closing') ||
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

type TextItem =
  | { kind: 'bullet'; text: string }
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'quote'; text: string };

/**
 * Prep markdown is hard-wrapped at ~95 columns, so one sentence arrives as
 * three lines and a bullet's links trail on indented continuations. Only a
 * blank line is a real break: everything else folds back into the block it
 * continues, so a paragraph renders as a paragraph.
 */
function groupTextLines(lines: string[]): TextItem[] {
  const items: TextItem[] = [];
  let isOpen = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (trimmed === '' || trimmed === '>') {
      isOpen = false;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      items.push({
        kind: 'heading',
        level: heading[1].length,
        text: heading[2],
      });
      isOpen = false;
      continue;
    }

    const bullet = trimmed.match(/^-+\s+(.+)$/);
    if (bullet) {
      items.push({ kind: 'bullet', text: bullet[1] });
      isOpen = true;
      continue;
    }

    const last = items[items.length - 1];
    const quote = trimmed.match(/^>\s?(.+)$/);
    if (quote) {
      if (isOpen && last?.kind === 'quote') last.text += ` ${quote[1]}`;
      else items.push({ kind: 'quote', text: quote[1] });
      isOpen = true;
      continue;
    }

    if (isOpen && last && last.kind !== 'heading') last.text += ` ${trimmed}`;
    else items.push({ kind: 'paragraph', text: trimmed });
    isOpen = true;
  }

  return items;
}

export function MarkdownBody({
  body,
  large,
}: {
  body: string;
  large?: boolean;
}) {
  const blocks: Array<
    { code: string; kind: 'code' } | { kind: 'text'; lines: string[] }
  > = [];
  let textLines: string[] = [];
  let codeLines: string[] = [];
  let inCodeBlock = false;

  for (const line of body.split('\n')) {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({ code: codeLines.join('\n').trimEnd(), kind: 'code' });
        codeLines = [];
        inCodeBlock = false;
      } else {
        if (textLines.some((textLine) => textLine.trim().length > 0)) {
          blocks.push({ kind: 'text', lines: textLines });
        }
        textLines = [];
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
    } else {
      textLines.push(line);
    }
  }

  if (inCodeBlock && codeLines.length > 0) {
    blocks.push({ code: codeLines.join('\n').trimEnd(), kind: 'code' });
  }

  if (textLines.some((line) => line.trim().length > 0)) {
    blocks.push({ kind: 'text', lines: textLines });
  }

  const textSize = large ? 'text-lg' : 'text-sm';
  const leading = large ? 'leading-[1.8]' : 'leading-relaxed';

  return (
    <div className={large ? 'space-y-4' : 'space-y-2.5'}>
      {blocks.map((block, blockIndex) => {
        if (block.kind === 'code') {
          return (
            <pre
              key={`code-${blockIndex}`}
              className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-surface-border bg-surface-elevated p-4 text-sm leading-relaxed text-text-primary"
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        return groupTextLines(block.lines).map((item, index) => {
          const key = `${blockIndex}-${index}`;

          if (item.kind === 'heading') {
            const headingClass =
              item.level <= 3
                ? `text-base font-semibold ${leading} text-text-primary`
                : item.level === 4
                  ? `text-sm font-semibold ${leading} text-text-secondary`
                  : `text-sm font-medium ${leading} text-text-muted`;
            return (
              <p key={key} className={headingClass}>
                {renderInlineMarkdown(item.text)}
              </p>
            );
          }

          if (item.kind === 'bullet') {
            return (
              <p
                key={key}
                className={`pl-5 ${textSize} ${leading} text-text-secondary before:-ml-5 before:mr-2 before:text-accent-red before:content-['-']`}
              >
                {renderInlineMarkdown(item.text)}
              </p>
            );
          }

          if (item.kind === 'quote') {
            return (
              <blockquote
                key={key}
                className={`border-l-2 border-accent-red/50 pl-4 ${textSize} ${leading} text-text-primary`}
              >
                {renderInlineMarkdown(item.text)}
              </blockquote>
            );
          }

          return (
            <p
              key={key}
              className={`${textSize} ${leading} text-text-secondary`}
            >
              {renderInlineMarkdown(item.text)}
            </p>
          );
        });
      })}
    </div>
  );
}
