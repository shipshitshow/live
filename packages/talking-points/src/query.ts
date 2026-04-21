const TREND_KEYWORD_STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'can',
  'shall',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'as',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'out',
  'off',
  'over',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'there',
  'when',
  'where',
  'why',
  'how',
  'all',
  'each',
  'every',
  'both',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'just',
  'because',
  'but',
  'and',
  'or',
  'if',
  'while',
  'about',
  'up',
  'its',
  'it',
  'this',
  'that',
  'these',
  'those',
  'i',
  'me',
  'my',
  'we',
  'our',
  'you',
  'your',
  'he',
  'him',
  'his',
  'she',
  'her',
  'they',
  'them',
  'their',
  'what',
  'which',
  'who',
  'whom',
  'new',
  'like',
  'get',
  'got',
  'also',
]);

const TOPIC_QUERY_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'but',
  'does',
  'for',
  'from',
  'into',
  'is',
  'it',
  'matter',
  'real',
  'still',
  'that',
  'the',
  'this',
  'with',
]);

export function extractTrendKeywords(titles: string[]): string {
  const wordFreq = new Map<string, number>();

  for (const title of titles) {
    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/);

    for (const word of words) {
      if (word.length < 3 || TREND_KEYWORD_STOP_WORDS.has(word)) continue;
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  }

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
    .join(' ');
}

export function buildTopicSearchQuery(title: string, summary?: string): string {
  const words = `${title} ${summary ?? ''}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (word) => word.length > 2 && !TOPIC_QUERY_STOP_WORDS.has(word),
    );

  const uniqueWords = Array.from(new Set(words)).slice(0, 6);
  if (uniqueWords.length === 0) return title;
  if (!uniqueWords.includes('ai')) uniqueWords.unshift('ai');
  return uniqueWords.join(' ');
}
