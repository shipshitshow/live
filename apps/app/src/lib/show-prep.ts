export interface ShowPrep {
  id: string;
  title: string;
  description: string;
  sourceEpisodeDate: string;
  rundown: string;
  scheduledFor: string | null;
  timezone: string;
  destinations: string[];
  restream: { eventId: string; links: string[] } | null;
}

export function validateEpisodeDate(value: string): string {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value
  ) {
    throw new Error('Use a real episode date in YYYY-MM-DD format.');
  }
  return value;
}

export function validatePrepId(value: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || value.length > 100) {
    throw new Error(
      'Draft id must be a lowercase slug of at most 100 characters.',
    );
  }
  return value;
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Expected a JSON object.');
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new Error(
      `${field} must be nonempty text of at most ${max} characters.`,
    );
  }
  return value;
}

function strings(value: unknown, field: string): string[] {
  if (
    !Array.isArray(value) ||
    value.length > 20 ||
    value.some(
      (item) => typeof item !== 'string' || !item.trim() || item.length > 500,
    ) ||
    new Set(value).size !== value.length
  ) {
    throw new Error(
      `${field} must be an array of up to 20 unique nonempty strings.`,
    );
  }
  return value as string[];
}

function links(value: unknown): string[] {
  const urls = strings(value, 'restream.links');
  for (const url of urls) {
    if (new URL(url).protocol !== 'https:')
      throw new Error('Event links must use HTTPS.');
  }
  return urls;
}

export function parseShowPrep(value: unknown): ShowPrep {
  const data = object(value);
  const keys = [
    'id',
    'title',
    'description',
    'sourceEpisodeDate',
    'rundown',
    'scheduledFor',
    'timezone',
    'destinations',
    'restream',
  ];
  if (Object.keys(data).some((key) => !keys.includes(key))) {
    throw new Error(
      'Draft contains unknown fields. Use the documented show-prep schema.',
    );
  }
  const timezone = text(data.timezone, 'timezone', 100);
  new Intl.DateTimeFormat('en', { timeZone: timezone });
  let scheduledFor: string | null = null;
  if (data.scheduledFor !== null) {
    scheduledFor = text(data.scheduledFor, 'scheduledFor', 50);
    if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
        scheduledFor,
      ) ||
      !Number.isFinite(Date.parse(scheduledFor))
    ) {
      throw new Error(
        'scheduledFor needs an ISO timestamp with an explicit UTC offset, or null.',
      );
    }
    validateEpisodeDate(scheduledFor.slice(0, 10));
  }
  let restream: ShowPrep['restream'] = null;
  if (data.restream !== null) {
    const event = object(data.restream);
    if (Object.keys(event).some((key) => !['eventId', 'links'].includes(key))) {
      throw new Error('Restream reference accepts only eventId and links.');
    }
    restream = {
      eventId: text(event.eventId, 'restream.eventId', 200),
      links: links(event.links),
    };
  }
  return {
    description: text(data.description, 'description', 5000),
    destinations: strings(data.destinations, 'destinations'),
    id: validatePrepId(text(data.id, 'id', 100)),
    restream,
    rundown: text(data.rundown, 'rundown', 100000),
    scheduledFor,
    sourceEpisodeDate: validateEpisodeDate(
      text(data.sourceEpisodeDate, 'sourceEpisodeDate', 10),
    ),
    timezone,
    title: text(data.title, 'title', 100),
  };
}
