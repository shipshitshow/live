import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { classifyPath } from '../producer-access';

const appRoot = join(import.meta.dir, '../../app');

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function pathname(file: string): string {
  const parts = relative(appRoot, file).split('/').slice(0, -1);
  return `/${parts.filter((part) => !part.startsWith('(')).join('/')}`;
}

describe('producer route coverage', () => {
  for (const file of filesUnder(join(appRoot, 'api')).filter((path) =>
    path.endsWith('/route.ts'),
  )) {
    const path = pathname(file);
    if (classifyPath(path) === 'public') continue;
    const source = readFileSync(file, 'utf8');
    if (/^export\s*\{[^}]+\}\s*from\s/m.test(source)) continue;

    test(`${path} guards every exported handler`, () => {
      const handlers = source.match(
        /export\s+async\s+function\s+(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g,
      );
      expect(handlers?.length).toBeGreaterThan(0);
      expect(source).toContain("from '@/lib/producer-auth'");
      expect(
        source.match(/await requireProducer\(\)/g)?.length ?? 0,
      ).toBeGreaterThanOrEqual(handlers?.length ?? 0);
    });
  }

  for (const group of ['(protected)', '(public)']) {
    for (const file of filesUnder(join(appRoot, group)).filter((path) =>
      path.endsWith('/page.tsx'),
    )) {
      const path = pathname(file);
      test(`${group} ${path} has the intended classification`, () => {
        const producer = group === '(protected)' || path.startsWith('/auth/');
        expect(classifyPath(path)).toBe(producer ? 'producer' : 'public');
      });
    }
  }
});
