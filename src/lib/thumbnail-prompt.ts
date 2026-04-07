interface ThumbnailInput {
  title: string;
  hotTake: string;
  source: string;
}

const STYLE_PRESETS = [
  "dramatic lighting with deep red and black color scheme",
  "bold neon glow on dark background, cyberpunk aesthetic",
  "split composition with high contrast red and dark tones",
  "cinematic close-up with intense backlighting, red accents",
  "glitch art aesthetic with red digital distortion effects",
];

const TEXT_STYLES = [
  "massive bold white Impact font with red drop shadow",
  "chunky 3D extruded text in white with red outline",
  "glowing red text with white stroke, slight perspective tilt",
  "stacked bold condensed text, white on dark with red highlight on key word",
];

const EXPRESSIONS = [
  "shocked developer staring at screen, mouth open, hands on head",
  "frustrated programmer slamming laptop shut, dramatic side lighting",
  "developer with wide eyes pointing at something off-screen",
  "person looking at phone screen with mix of horror and disbelief",
  "indie dev at desk surrounded by monitors showing error screens",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function extractKeyword(title: string): string {
  const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "for", "and", "or", "but", "in", "on", "at", "to", "of", "its", "via"]);
  const words = title.split(/\s+/).filter(w => !stopWords.has(w.toLowerCase()) && w.length > 2);
  return words.slice(0, 3).join(" ");
}

function generateOverlayText(title: string): string {
  const keyword = extractKeyword(title);
  const templates = [
    `"${keyword.toUpperCase()}"`,
    `IT'S OVER.`,
    `WE NEED TO TALK...`,
    `THIS CHANGES EVERYTHING`,
    `${keyword.toUpperCase()} IS DEAD?!`,
    `NOT GOOD.`,
  ];
  return pickRandom(templates);
}

export function generateThumbnailPrompt(input: ThumbnailInput): string {
  const style = pickRandom(STYLE_PRESETS);
  const textStyle = pickRandom(TEXT_STYLES);
  const expression = pickRandom(EXPRESSIONS);
  const overlayText = generateOverlayText(input.title);

  return `YouTube thumbnail, 1280x720, ${style}.

SCENE: ${expression}. Background shows faint code editor with syntax highlighting. Subtle Ship Shit Show branding (red accent color #ff2d20).

TEXT OVERLAY: ${overlayText} — rendered in ${textStyle}. Position: right third of frame, slightly angled for energy.

ADDITIONAL ELEMENTS: Small source badges (${input.source}) in corner. Red arrow pointing at the key visual element. Slight vignette darkening edges.

MOOD: Urgent, dramatic, "you need to see this" energy. High contrast. The kind of thumbnail that makes dev Twitter stop scrolling.

CONTEXT: ${input.title} — ${input.hotTake}

STYLE: YouTube tech commentary thumbnail, NOT stock photo. Think: Fireship, Theo, ThePrimeagen aesthetic. Bold, punchy, impossible to ignore.`;
}
