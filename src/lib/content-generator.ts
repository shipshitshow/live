// Content generator for Ship Shit Show livestream episodes
// Generates 3 thumbnail prompt variants + all social copy

export interface ContentInput {
  title: string;
  hotTake: string;
  summary: string;
  source: string;
  date: string;
}

export interface ThumbnailVariant {
  label: string;
  prompt: string;
}

export interface GeneratedContent {
  thumbnails: [ThumbnailVariant, ThumbnailVariant, ThumbnailVariant];
  youtubeTitle: string;
  youtubeDescription: string;
  linkedinPost: string;
  livestreamTweet: string;
  recapTweet: string;
}

// ─── Host descriptions (consistent across all prompts) ───

const HOST_LEFT = `Bald man with light tan/olive skin, stubble, green-hazel eyes, wearing black t-shirt`;
const HOST_RIGHT = `Man with dark wavy brown hair, wearing navy blue polo shirt`;

// ─── Expression pools ───

interface ExpressionPair {
  left: string;
  right: string;
  vibe: string;
}

const SHOCKED_EXPRESSIONS: ExpressionPair[] = [
  {
    left: "Mouth wide open in shock, both hands up with fingers spread. Can't believe what just happened.",
    right: "Both hands on cheeks, jaw dropped, eyes huge. Total disbelief.",
    vibe: "shock",
  },
  {
    left: "Eyes bulging, one hand grabbing the top of his head, mouth in a perfect O shape.",
    right: "Leaning back with both fists clenched near his chin, face frozen in a gasp.",
    vibe: "shock",
  },
  {
    left: "Both hands covering his mouth, eyes wide, leaning forward like he just saw something he shouldn't have.",
    right: "Pointing at the background with one hand, other hand slapping his own forehead.",
    vibe: "shock",
  },
];

const CONFIDENT_EXPRESSIONS: ExpressionPair[] = [
  {
    left: "Arms crossed, confident smirk, one eyebrow raised. Boss energy.",
    right: "One hand making OK sign, big satisfied grin. 'It works' energy.",
    vibe: "confident",
  },
  {
    left: "Leaning back, both hands behind head, huge relaxed grin. 'Told you so' energy.",
    right: "Both hands gesturing toward the background, mouth open excited, presenting.",
    vibe: "confident",
  },
  {
    left: "One hand pointing at camera, slight head tilt, knowing smile.",
    right: "Both fists raised in celebration, huge grin, excited energy.",
    vibe: "confident",
  },
];

const SERIOUS_EXPRESSIONS: ExpressionPair[] = [
  {
    left: "Hand on chin, squinting, analyzing. Deep thought. Skeptical.",
    right: "Slight frown, head tilted, arms crossed. Not buying it.",
    vibe: "serious",
  },
  {
    left: "One eyebrow raised, slight frown, arms crossed. 'We need to talk about this' energy.",
    right: "Hand rubbing the back of his neck, concerned look, lips pressed tight.",
    vibe: "serious",
  },
];

// All expression pools combined for mixed picking
const ALL_EXPRESSIONS = [...SHOCKED_EXPRESSIONS, ...CONFIDENT_EXPRESSIONS, ...SERIOUS_EXPRESSIONS];

// ─── Helpers ───

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatDate(date: string): string {
  const d = new Date(date + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

// ─── Thumbnail prompt builder ───

interface ThumbnailScene {
  label: string;
  expressions: ExpressionPair;
  background: string;
  centerElement: string;
  bottomElement: string;
  lighting: string;
}

function buildThumbnailPrompt(scene: ThumbnailScene): string {
  return `SCENE: Two men from chest up, YouTube thumbnail 16:9 aspect ratio, wide angle lens. Faces on outer edges.

SUBJECT LEFT (far left): ${HOST_LEFT}. ${scene.expressions.left}

SUBJECT RIGHT (far right): ${HOST_RIGHT}. ${scene.expressions.right}

BACKGROUND (entire frame): ${scene.background}

CENTER TOP (floating in front): ${scene.centerElement}

BOTTOM CENTER (tiny): ${scene.bottomElement}

LIGHTING: ${scene.lighting}

STYLE: Photorealistic faces, glossy 3D icons, realistic dark UI/background. Dynamic, alive. Readable at 120px.

NEGATIVE PROMPT: No readable text on any elements, no words, no branding, no watermarks, no letters, no numbers.`;
}

function generateScenes(input: ContentInput): [ThumbnailScene, ThumbnailScene, ThumbnailScene] {
  const titleLower = input.title.toLowerCase();

  // Determine color theme from content
  let accentColor = "blue-cyan";
  let accentGlow = "Blue-cyan glow";
  if (titleLower.includes("red") || titleLower.includes("dead") || titleLower.includes("kill") || titleLower.includes("ban") || titleLower.includes("worst")) {
    accentColor = "red-orange";
    accentGlow = "Red-orange glow";
  } else if (titleLower.includes("launch") || titleLower.includes("new") || titleLower.includes("ship")) {
    accentColor = "green-cyan";
    accentGlow = "Green-cyan glow";
  } else if (titleLower.includes("leak") || titleLower.includes("hack") || titleLower.includes("security")) {
    accentColor = "red-crimson";
    accentGlow = "Deep red glow";
  }

  // Version 1: SHOCK — dramatic, something just happened
  const scene1: ThumbnailScene = {
    label: "Shock & Drama",
    expressions: pickRandom(SHOCKED_EXPRESSIONS),
    background: `A dark gray-black dashboard UI that is GLITCHING and BREAKING apart in real time. Cards, panels, and data visualizations fragmenting with ${accentColor} energy particles. Cracks spreading across the screen. Some elements dissolving into pixels. The entire interface is destabilizing. Error states and warning indicators pulsing. Feels like watching a system meltdown in real time.`,
    centerElement: `A 3D glossy dark rounded square icon relevant to the topic, glowing ${accentColor} with lens flare and energy sparks radiating outward. It's the source of the chaos. Lightning bolts or energy streams flowing from it into the breaking dashboard.`,
    bottomElement: `Small cracked element with X eyes, being crushed or consumed by the chaos above. Faded, broken, disappearing. An afterthought.`,
    lighting: `${accentGlow} from the center icon and the breaking elements. Brighter where destruction is happening. High contrast. Cinematic. Chaotic energy.`,
  };

  // Version 2: CONFIDENT — they know something you don't
  const scene2: ThumbnailScene = {
    label: "Boss Energy",
    expressions: pickRandom(CONFIDENT_EXPRESSIONS),
    background: `A dark gray-black corporate dashboard UI, slightly zoomed in and tilted at a subtle 3D angle as if viewed on a large monitor. Clean, organized cards with abstract icons and colored status dots. The whole dashboard has a subtle ${accentColor} tint and glow on the card edges, making it feel alive and active. Everything is running smoothly — the system works.`,
    centerElement: `A 3D glossy dark rounded square icon relevant to the topic, glowing ${accentColor}, positioned above the dashboard like the mastermind. Energy lines connecting from it down to the UI elements, showing it controls everything.`,
    bottomElement: `Small cracked light blue cloud with X eyes, faded, pushed to the edge. Barely noticeable.`,
    lighting: `Soft ${accentColor.split("-")[0]} glow from the icon illuminating both men. Subtle glow from the dashboard background. High contrast on faces. Cinematic.`,
  };

  // Version 3: EXPANDING — growth, scale, something is building
  const scene3: ThumbnailScene = {
    label: "Scale & Growth",
    expressions: pickRandom(ALL_EXPRESSIONS),
    background: `A dark gray-black dashboard UI that is EXPANDING and GROWING in real time. Core elements are solid and stable. But at the edges, NEW elements are appearing, materializing from ${accentColor} energy particles, half-formed, assembling themselves. Glowing construction sparks at each new element being created. Some fully formed, others translucent outlines still loading in. The system is actively scaling and building itself as you watch.`,
    centerElement: `A 3D glossy dark icon with a white symbol, glowing ${accentColor} with lens flare. Energy streams flowing from it outward to all the new elements being created. It's the engine driving the expansion.`,
    bottomElement: `Small cracked element with X eyes, being covered by the expanding elements above it. Disappearing under the growth.`,
    lighting: `${accentGlow} from the icon and the assembling elements. Brighter where new elements are forming. High contrast. Cinematic. Energetic.`,
  };

  return [scene1, scene2, scene3];
}

// ─── Thumbnail variant generators (exported for individual regen) ───

export function generateThumbnailV1(input: ContentInput): string {
  const scenes = generateScenes(input);
  return buildThumbnailPrompt(scenes[0]);
}

export function generateThumbnailV2(input: ContentInput): string {
  const scenes = generateScenes(input);
  return buildThumbnailPrompt(scenes[1]);
}

export function generateThumbnailV3(input: ContentInput): string {
  const scenes = generateScenes(input);
  return buildThumbnailPrompt(scenes[2]);
}

// ─── Social copy generators (exported for individual regen) ───

export function generateYouTubeTitle(input: ContentInput): string {
  const templates = [
    (t: string) => t,
    (t: string) => {
      const parts = t.split(/\s*[-—:]\s*/);
      return parts.length > 1 ? `${parts[0]} (${parts.slice(1).join(" — ")})` : t;
    },
  ];
  const title = pickRandom(templates)(input.title);
  // Ensure under 100 chars
  return title.length > 100 ? title.slice(0, 97) + "..." : title;
}

export function generateYouTubeDescription(input: ContentInput): string {
  const formattedDate = formatDate(input.date);
  return `${input.summary}

${input.hotTake ? `🔥 HOT TAKE: ${input.hotTake}\n` : ""}
⏰ TIMESTAMPS
00:00 — Cold Open
02:00 — Main Story
25:00 — Deep Dive
45:00 — Hot Take
50:00 — Q&A + Wrap Up

📡 LIVE every week — subscribe and hit the bell so you don't miss the next one.

🔗 LINKS & SOURCES
(drop source links here after the stream)

Recorded ${formattedDate}

#shipshitshow #ai #tech #devnews`;
}

export function generateLinkedInPost(input: ContentInput): string {
  const hook = input.summary.split(".").slice(0, 2).join(".") + ".";
  return `${hook}

We broke it all down on this week's Ship Shit Show.

${input.hotTake ? `My hot take: ${input.hotTake}\n` : ""}
Watch the full stream 👇
(link)

#AI #DevNews #TechIndustry #SoftwareEngineering`;
}

export function generateLivestreamTweet(input: ContentInput): string {
  const hook = input.summary.split(".")[0] + ".";
  const shortHook = hook.length > 140 ? hook.slice(0, 137) + "..." : hook;
  return `🔴 LIVE NOW — Ship Shit Show

${shortHook}

We're breaking it all down.

tune in 👇
(link)`;
}

export function generateRecapTweet(input: ContentInput): string {
  const hook = input.hotTake
    ? input.hotTake.split(".").slice(0, 2).join(".") + "."
    : input.summary.split(".")[0] + ".";
  const shortHook = hook.length > 160 ? hook.slice(0, 157) + "..." : hook;
  return `${shortHook}

Full breakdown from this week's Ship Shit Show 👇
(link)`;
}

// ─── Main export ───

export function generateAllContent(input: ContentInput): GeneratedContent {
  const scenes = generateScenes(input);

  return {
    thumbnails: [
      { label: scenes[0].label, prompt: buildThumbnailPrompt(scenes[0]) },
      { label: scenes[1].label, prompt: buildThumbnailPrompt(scenes[1]) },
      { label: scenes[2].label, prompt: buildThumbnailPrompt(scenes[2]) },
    ],
    youtubeTitle: generateYouTubeTitle(input),
    youtubeDescription: generateYouTubeDescription(input),
    linkedinPost: generateLinkedInPost(input),
    livestreamTweet: generateLivestreamTweet(input),
    recapTweet: generateRecapTweet(input),
  };
}
