const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  bull: '•',
  gt: '>',
  hellip: '…',
  ldquo: '“',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  nbsp: ' ',
  ndash: '–',
  quot: '"',
  rdquo: '”',
  rsquo: '’',
};

const HIDDEN_ELEMENTS =
  /<(script|style|template|iframe|object|noscript|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const ANCHOR =
  /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a\s*>/gi;
const BLOCK_BOUNDARY =
  /<\/?(?:p|div|li|ul|ol|blockquote|pre|h[1-6]|tr|table)\b[^>]*>/gi;

function isValidCodePoint(codePoint: number): boolean {
  return (
    Number.isInteger(codePoint) &&
    codePoint > 0 &&
    codePoint <= 0x10ffff &&
    (codePoint < 0xd800 || codePoint > 0xdfff)
  );
}

// Single pass, so `&amp;lt;` becomes the literal text `&lt;`, never `<`.
function decodeHtmlEntities(text: string): string {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (match, entity: string) => {
      if (entity.startsWith('#')) {
        const hex = entity[1] === 'x' || entity[1] === 'X';
        const codePoint = Number.parseInt(
          entity.slice(hex ? 2 : 1),
          hex ? 16 : 10,
        );
        return isValidCodePoint(codePoint)
          ? String.fromCodePoint(codePoint)
          : match;
      }
      return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
    },
  );
}

function escapeText(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/<[a-z!/][^>]*$/i, '');
}

function anchorToText(
  _match: string,
  doubleQuoted: string | undefined,
  singleQuoted: string | undefined,
  unquoted: string | undefined,
  inner: string,
): string {
  const href = decodeHtmlEntities(
    doubleQuoted ?? singleQuoted ?? unquoted ?? '',
  ).trim();
  const label = decodeHtmlEntities(stripTags(inner)).trim();
  const safeHref = /^https?:\/\//i.test(href) ? href : '';

  // Re-escaped so the final decode pass cannot turn link text into markup.
  if (!label) return escapeText(safeHref);
  if (!safeHref || label === safeHref) return escapeText(label);
  return escapeText(`${label} (${safeHref})`);
}

function htmlToPlainText(html: string): string {
  const withoutMarkup = stripTags(
    html
      .replace(/<!--[\s\S]*?(?:-->|$)/g, '')
      .replace(HIDDEN_ELEMENTS, '')
      .replace(ANCHOR, anchorToText)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(BLOCK_BOUNDARY, '\n\n'),
  );

  return decodeHtmlEntities(withoutMarkup)
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Imported summaries (HN `story_text`, Reddit `selftext`) arrive as HTML or
 * entity-escaped text. Convert them to plain text before truncating so the
 * preview budget is spent on readable words, not markup. The result is
 * rendered as React text, so nothing imported is ever executed.
 */
export function toPlainTextSummary(
  raw: string | null | undefined,
  maxLength = 200,
): string | undefined {
  if (!raw) return undefined;

  const text = htmlToPlainText(raw);
  if (!text) return undefined;
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength - 1);
  const endsOnWord = /\s/.test(text[maxLength - 1] ?? '');
  const boundary = clipped.search(/\s\S*$/);
  const cut =
    endsOnWord || boundary <= maxLength * 0.6
      ? clipped
      : clipped.slice(0, boundary);
  return `${cut.trimEnd()}…`;
}
