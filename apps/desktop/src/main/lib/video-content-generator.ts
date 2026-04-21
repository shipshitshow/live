interface VideoContentInput {
  title: string;
  videoType: 'video' | 'short';
  channelLabel: string;
  duration: number;
}

export interface VideoGeneratedContent {
  titles: string[];
  youtubeDescription: string;
  linkedinPost: string;
  announcementTweet: string;
  recapTweet: string;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTitles(input: VideoContentInput): string[] {
  const base = input.title;
  const words = base.split(/\s+/);
  const variants: string[] = [base];

  const urgencyPrefixes = [
    'BREAKING:',
    'This Changes Everything —',
    'Nobody Is Talking About',
    'The Truth About',
    'We Need to Talk About',
  ];
  variants.push(`${pickRandom(urgencyPrefixes)} ${base}`);

  if (!base.includes('?')) {
    const questionTemplates = [
      `Is ${base} Actually Real?`,
      `${base} — But Should You Care?`,
      `${words.slice(0, 4).join(' ')}... Wait, What?`,
    ];
    variants.push(pickRandom(questionTemplates));
  } else {
    variants.push(base.replace('?', '?!'));
  }

  return variants.map((t) => (t.length > 100 ? `${t.slice(0, 97)}...` : t));
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function generateYouTubeDescription(input: VideoContentInput): string {
  const isShort = input.videoType === 'short';
  const duration = formatDuration(input.duration);

  if (isShort) {
    return `${input.title}\n\n#shorts #ai #tech #shipshitshow\n\nSubscribe for more AI & tech takes → @shipshitshow`;
  }

  return `${input.title}\n\n⏱️ Duration: ${duration}\n\n⏰ TIMESTAMPS\n(fill in after review)\n\n📡 Subscribe and hit the bell for more AI & tech breakdowns.\n\n🔗 LINKS & SOURCES\n(add links here)\n\n#shipshitshow #ai #tech #devnews`;
}

function generateLinkedInPost(input: VideoContentInput): string {
  return `New drop: ${input.title}\n\nFull breakdown on the channel 👇\n(link)\n\n#AI #DevNews #TechIndustry #SoftwareEngineering`;
}

function generateAnnouncementTweet(input: VideoContentInput): string {
  const isShort = input.videoType === 'short';
  const prefix = isShort ? '🎬 New short:' : '🔴 New video:';
  const title =
    input.title.length > 120 ? `${input.title.slice(0, 117)}...` : input.title;
  return `${prefix} ${title}\n\n👇\n(link)`;
}

function generateRecapTweet(input: VideoContentInput): string {
  const title =
    input.title.length > 140 ? `${input.title.slice(0, 137)}...` : input.title;
  return `${title}\n\nFull video 👇\n(link)`;
}

export function generateVideoContent(
  input: VideoContentInput,
): VideoGeneratedContent {
  return {
    announcementTweet: generateAnnouncementTweet(input),
    linkedinPost: generateLinkedInPost(input),
    recapTweet: generateRecapTweet(input),
    titles: generateTitles(input),
    youtubeDescription: generateYouTubeDescription(input),
  };
}

export function regenerateField(
  input: VideoContentInput,
  field: keyof VideoGeneratedContent,
): string | string[] {
  const full = generateVideoContent(input);
  return full[field];
}
