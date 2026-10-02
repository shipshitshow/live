import { describe, expect, test } from 'bun:test';
import {
  getProductionApp,
  getProductionPageLabel,
  isNavigationActive,
} from './app-navigation';

describe('production route ownership', () => {
  test('keeps the public library and sign-in outside production apps', () => {
    expect(getProductionApp('/')).toBeUndefined();
    expect(getProductionApp('/sign-in')).toBeUndefined();
  });
  test('resolves module deep links and existing aliases without prefix collisions', () => {
    for (const path of [
      '/livestreams/example/talking-points',
      '/livestream/example',
      '/live-stream/2026-10-02',
      '/videos/example',
    ])
      expect(getProductionApp(path)?.id).toBe('shows');
    expect(getProductionApp('/analytics/episodes')?.id).toBe('analytics');
    expect(getProductionApp('/leads')?.id).toBe('partnerships');
    expect(getProductionApp('/topics')?.id).toBe('research');
    expect(getProductionApp('/socials')?.id).toBe('socials');
    expect(isNavigationActive('/analytics-other', '/analytics')).toBe(false);
  });
  test('labels episode tabs and episode analytics accurately', () => {
    expect(getProductionPageLabel('/livestreams/example/resources')).toBe(
      'Resources',
    );
    expect(getProductionPageLabel('/analytics/episodes')).toBe(
      'Episode performance',
    );
  });
});
