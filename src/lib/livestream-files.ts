import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "livestream");

export function findTopicFile(slug: string, date: string): string | null {
  const dir = path.join(DATA_DIR, date);
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".md"));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    if (raw.includes(`slug: "${slug}"`)) {
      return path.join(dir, file);
    }
  }

  return null;
}
