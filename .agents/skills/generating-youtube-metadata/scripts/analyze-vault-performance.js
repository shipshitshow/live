#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const DEFAULT_REPO = "shipshitshow/vault";

function parseArgs(argv) {
  const args = { vault: DEFAULT_REPO, channel: "all", format: "json", top: 3 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--vault" && argv[i + 1]) {
      args.vault = argv[++i];
    } else if (arg === "--channel" && argv[i + 1]) {
      args.channel = argv[++i];
    } else if (arg === "--format" && argv[i + 1]) {
      args.format = argv[++i];
    } else if (arg === "--top" && argv[i + 1]) {
      args.top = Number(argv[++i]);
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }
  return args;
}

function usage() {
  console.log(
    [
      "Usage: analyze-vault-performance.js [--vault <path|repo|url>] [--channel videos|shorts|all] [--format json|pretty] [--top N]",
      "",
      "Examples:",
      "  node analyze-vault-performance.js --vault /path/to/vault --channel videos --format pretty",
      "  node analyze-vault-performance.js --vault https://github.com/shipshitshow/vault --channel all --format json",
      "  node analyze-vault-performance.js --vault shipshitshow/vault --channel shorts --top 5 --format pretty",
    ].join("\n"),
  );
}

function ensureCommand(cmd) {
  try {
    execFileSync("which", [cmd], { stdio: "ignore" });
  } catch (error) {
    throw new Error(`Required command not found: ${cmd}`);
  }
}

function parseRepoSpec(input) {
  if (/^https?:\/\/github\.com\//i.test(input)) {
    const match = input.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+)/i);
    return match ? match[1].replace(/\.git$/, "") : null;
  }
  if (/^[^/]+\/[^/]+$/.test(input)) {
    return input.replace(/\.git$/, "");
  }
  return null;
}

function resolveVaultRoot(vaultArg) {
  if (vaultArg && fs.existsSync(vaultArg)) {
    return { kind: "local", root: path.resolve(vaultArg), cleanup: null };
  }

  const repo = parseRepoSpec(vaultArg || DEFAULT_REPO);
  if (!repo) {
    throw new Error(`Vault path does not exist and is not a GitHub repo: ${vaultArg}`);
  }

  ensureCommand("curl");
  ensureCommand("tar");

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vault-analysis-"));
  let extractedRoot = null;

  for (const branch of ["master", "main"]) {
    const archivePath = path.join(tmpDir, `${branch}.tar.gz`);
    const archiveUrl = `https://codeload.github.com/${repo}/tar.gz/refs/heads/${branch}`;
    try {
      execFileSync("curl", ["-L", "-s", "-f", archiveUrl, "-o", archivePath], { stdio: "inherit" });
      execFileSync("tar", ["-xzf", archivePath, "-C", tmpDir], { stdio: "inherit" });
      extractedRoot = fs
        .readdirSync(tmpDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(tmpDir, entry.name))
        .find((entryPath) => path.basename(entryPath).startsWith(path.basename(repo).split("/").pop()));
      if (extractedRoot) {
        break;
      }
    } catch (error) {
      // Try the next branch name.
    }
  }

  if (!extractedRoot) {
    throw new Error(`Failed to extract vault archive for ${repo}`);
  }

  return {
    kind: "github",
    root: extractedRoot,
    cleanup: () => fs.rmSync(tmpDir, { recursive: true, force: true }),
    repo,
  };
}

function readFileIfPresent(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return {};
  }

  const lines = match[1].split("\n");
  const data = {};
  let currentListKey = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");
    if (/^\s*-\s+/.test(line) && currentListKey) {
      const value = sanitizeFrontmatterValue(line.replace(/^\s*-\s+/, ""));
      data[currentListKey].push(value);
      continue;
    }

    const keyValue = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!keyValue) {
      currentListKey = null;
      continue;
    }

    const [, key, rawValue] = keyValue;
    if (rawValue === "") {
      data[key] = [];
      currentListKey = key;
      continue;
    }

    currentListKey = null;
    data[key] = sanitizeFrontmatterValue(rawValue);
  }

  return data;
}

function sanitizeFrontmatterValue(value) {
  return value.replace(/^"|"$/g, "").replace(/```/g, "").replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
}

function extractSection(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^## ${escaped}\\n\\n([\\s\\S]*?)(?=\\n## |$)`, "m");
  const match = markdown.match(regex);
  return match ? match[1].trim() : "";
}

function tokenizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token && token.length > 2);
}

function classifyTitlePatterns(title) {
  const patterns = new Set();
  if (/\bvs\b|versus|not even close|verdict/i.test(title)) {
    patterns.add("comparison");
  }
  if (/killed|dead|save it|won't let|too powerful|replaced|destroyed/i.test(title)) {
    patterns.add("conflict");
  }
  if (/disaster|lose your .* job|nightmare|gone wrong|breach/i.test(title)) {
    patterns.add("disaster");
  }
  if (/^how to|install|setup|tutorial/i.test(title)) {
    patterns.add("tutorial");
  }
  if (/\b\d+\b|million|days|months|week/i.test(title)) {
    patterns.add("number-time");
  }
  if (/\?|what|why|how/i.test(title)) {
    patterns.add("curiosity");
  }
  if (/controls my computer|built|rebuild|automate|chatting/i.test(title)) {
    patterns.add("demonstration");
  }
  return [...patterns];
}

function collectEntries(root, channelKey) {
  const entries = [];

  if (channelKey === "videos") {
    const base = path.join(root, "shipshitshow", "Videos");
    if (!fs.existsSync(base)) {
      return entries;
    }
    for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith("_")) {
        continue;
      }
      entries.push(loadEntry(root, path.join(base, entry.name), "videos"));
    }
    return entries.filter(Boolean);
  }

  const base = path.join(root, "shipshitshowclips", "Shorts");
  if (!fs.existsSync(base)) {
    return entries;
  }

  for (const dateDir of fs.readdirSync(base, { withFileTypes: true })) {
    if (!dateDir.isDirectory() || dateDir.name.startsWith("_")) {
      continue;
    }
    const datePath = path.join(base, dateDir.name);
    for (const variantDir of fs.readdirSync(datePath, { withFileTypes: true })) {
      if (!variantDir.isDirectory()) {
        continue;
      }
      entries.push(loadEntry(root, path.join(datePath, variantDir.name), "shorts"));
    }
  }

  return entries.filter(Boolean);
}

function loadEntry(root, dirPath, format) {
  const overviewPath = path.join(dirPath, "overview.md");
  if (!fs.existsSync(overviewPath)) {
    return null;
  }

  const overview = fs.readFileSync(overviewPath, "utf8");
  const frontmatter = parseFrontmatter(overview);
  const title = frontmatter.title || path.basename(dirPath);
  const views = Number(frontmatter.view_count || 0);
  const youtubeTags = Array.isArray(frontmatter.youtube_tags) ? frontmatter.youtube_tags : [];

  return {
    format,
    dirPath,
    relativePath: path.relative(root, dirPath),
    title,
    views,
    date: frontmatter.date || "",
    youtubeTags,
    summary: extractSection(overview, "Summary"),
    description: readFileIfPresent(path.join(dirPath, "description.md")),
    transcript: readFileIfPresent(path.join(dirPath, "transcript.md")),
    patterns: classifyTitlePatterns(title),
    titleTokens: tokenizeTitle(title),
  };
}

function topWords(entries, count) {
  const scores = new Map();
  for (const entry of entries) {
    for (const token of entry.titleTokens) {
      scores.set(token, (scores.get(token) || 0) + entry.views);
    }
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word, score]) => ({ word, weightedViews: score }));
}

function topTags(entries, count) {
  const scores = new Map();
  for (const entry of entries) {
    for (const tag of entry.youtubeTags) {
      const key = tag.toLowerCase();
      const current = scores.get(key) || { tag, occurrences: 0, weightedViews: 0 };
      current.occurrences += 1;
      current.weightedViews += entry.views;
      scores.set(key, current);
    }
  }
  return [...scores.values()]
    .sort((a, b) => b.weightedViews - a.weightedViews)
    .slice(0, count);
}

function summarizeChannel(entries, topN) {
  const sorted = [...entries].sort((a, b) => b.views - a.views);
  const total = sorted.length;
  const third = Math.max(1, Math.ceil(total / 3));
  const winnerSet = sorted.slice(0, third);
  const weakSet = sorted.slice(Math.max(0, total - third));
  const middleStart = Math.max(0, Math.floor((total - third) / 2));
  const medianSet = sorted.slice(middleStart, middleStart + third);
  const patternScores = new Map();

  for (const entry of winnerSet) {
    for (const pattern of entry.patterns) {
      patternScores.set(pattern, (patternScores.get(pattern) || 0) + entry.views);
    }
  }

  const viewValues = sorted.map((entry) => entry.views);
  const averageViews = total === 0 ? 0 : viewValues.reduce((sum, value) => sum + value, 0) / total;
  const medianViews =
    total === 0
      ? 0
      : total % 2 === 1
        ? viewValues[Math.floor(total / 2)]
        : (viewValues[total / 2 - 1] + viewValues[total / 2]) / 2;

  return {
    count: total,
    averageViews: Number(averageViews.toFixed(1)),
    medianViews,
    winners: winnerSet.slice(0, topN).map(trimEntry),
    median: medianSet.slice(0, topN).map(trimEntry),
    weak: weakSet.slice(0, topN).map(trimEntry),
    weightedTags: topTags(sorted, 10),
    weightedTitleWords: topWords(winnerSet, 10),
    winnerPatterns: [...patternScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([pattern, weightedViews]) => ({ pattern, weightedViews })),
  };
}

function trimEntry(entry) {
  return {
    title: entry.title,
    views: entry.views,
    date: entry.date,
    relativePath: entry.relativePath,
    patterns: entry.patterns,
    youtubeTags: entry.youtubeTags.slice(0, 8),
  };
}

function renderPretty(report, requestedChannels) {
  const lines = [];
  lines.push(`# Vault Performance Report`);
  lines.push("");
  lines.push(`- source: ${report.source.kind}${report.source.repo ? ` (${report.source.repo})` : ""}`);
  lines.push(`- root: ${report.source.root}`);
  lines.push(`- channels: ${requestedChannels.join(", ")}`);
  lines.push("");

  for (const channel of requestedChannels) {
    const summary = report.channels[channel];
    if (!summary) {
      continue;
    }
    lines.push(`## ${channel}`);
    lines.push("");
    lines.push(`- count: ${summary.count}`);
    lines.push(`- average views: ${summary.averageViews}`);
    lines.push(`- median views: ${summary.medianViews}`);
    lines.push("");
    lines.push(`### winners`);
    for (const item of summary.winners) {
      lines.push(`- ${item.views} - ${item.title}`);
    }
    lines.push("");
    lines.push(`### median`);
    for (const item of summary.median) {
      lines.push(`- ${item.views} - ${item.title}`);
    }
    lines.push("");
    lines.push(`### weak`);
    for (const item of summary.weak) {
      lines.push(`- ${item.views} - ${item.title}`);
    }
    lines.push("");
    lines.push(`### winner patterns`);
    for (const item of summary.winnerPatterns.slice(0, 8)) {
      lines.push(`- ${item.pattern}: ${item.weightedViews}`);
    }
    lines.push("");
    lines.push(`### weighted tags`);
    for (const item of summary.weightedTags.slice(0, 8)) {
      lines.push(`- ${item.tag}: ${item.weightedViews} weighted views across ${item.occurrences} entries`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }

  const source = resolveVaultRoot(args.vault);
  const requestedChannels =
    args.channel === "all" ? ["videos", "shorts"] : args.channel === "videos" ? ["videos"] : ["shorts"];

  try {
    const report = {
      source: {
        kind: source.kind,
        root: source.root,
        repo: source.repo || null,
      },
      channels: {},
    };

    for (const channel of requestedChannels) {
      const entries = collectEntries(source.root, channel);
      report.channels[channel] = summarizeChannel(entries, args.top);
    }

    if (args.format === "pretty") {
      console.log(renderPretty(report, requestedChannels));
      return;
    }

    console.log(JSON.stringify(report, null, 2));
  } finally {
    if (typeof source.cleanup === "function") {
      source.cleanup();
    }
  }
}

main();
