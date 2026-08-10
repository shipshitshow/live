import { describe, expect, test } from 'bun:test';
import {
  buildEpisodeCampaign,
  buildUtmUrl,
  extractEpisodeNumber,
  isEpisodeCampaign,
  parseEpisodeCampaign,
} from '@/lib/utm';

describe('buildEpisodeCampaign', () => {
  test('builds the ep-<NN>-<slug> convention', () => {
    expect(buildEpisodeCampaign(24, 'quota-endgame')).toBe(
      'ep-24-quota-endgame',
    );
  });

  test('normalizes a human title into a campaign-safe slug', () => {
    expect(buildEpisodeCampaign(24, 'Quota Endgame & the $272K Tripwire')).toBe(
      'ep-24-quota-endgame-the-272k-tripwire',
    );
  });

  test('refuses to mint a campaign without a usable episode number', () => {
    expect(buildEpisodeCampaign(null, 'quota-endgame')).toBeNull();
    expect(buildEpisodeCampaign(0, 'quota-endgame')).toBeNull();
    expect(buildEpisodeCampaign(-4, 'quota-endgame')).toBeNull();
    expect(buildEpisodeCampaign(2.5, 'quota-endgame')).toBeNull();
  });

  test('refuses to mint a campaign without a usable slug', () => {
    expect(buildEpisodeCampaign(24, '')).toBeNull();
    expect(buildEpisodeCampaign(24, '!!!')).toBeNull();
  });
});

describe('parseEpisodeCampaign', () => {
  test('splits a campaign back into its parts', () => {
    expect(parseEpisodeCampaign('ep-24-quota-endgame')).toEqual({
      campaign: 'ep-24-quota-endgame',
      episodeNumber: 24,
      slug: 'quota-endgame',
    });
  });

  test('rejects anything outside the convention', () => {
    expect(parseEpisodeCampaign('ep-24')).toBeNull();
    expect(parseEpisodeCampaign('episode-24-thing')).toBeNull();
    expect(parseEpisodeCampaign("ep-24-a' OR 1=1--")).toBeNull();
  });
});

describe('isEpisodeCampaign', () => {
  test('guards the strings that reach HogQL', () => {
    expect(isEpisodeCampaign('ep-1-a')).toBe(true);
    expect(isEpisodeCampaign("ep-1-a'")).toBe(false);
    expect(isEpisodeCampaign('ep-1-a b')).toBe(false);
  });
});

describe('extractEpisodeNumber', () => {
  test('reads the prep-notes episode marker', () => {
    expect(extractEpisodeNumber('- Episode number: **#24**')).toBe(24);
  });

  test('takes the first marker when a file repeats it', () => {
    expect(
      extractEpisodeNumber('- Episode number: **#24**\nEpisode number: #99'),
    ).toBe(24);
  });

  test('returns null when the file has no marker', () => {
    expect(extractEpisodeNumber('## Sources\n- Nothing here')).toBeNull();
  });
});

describe('buildUtmUrl', () => {
  test('tags a link for LinkedIn', () => {
    expect(
      buildUtmUrl('https://show.shipshit.dev/ep24', {
        campaign: 'ep-24-quota-endgame',
        source: 'linkedin',
      }),
    ).toBe(
      'https://show.shipshit.dev/ep24?utm_source=linkedin&utm_medium=social&utm_campaign=ep-24-quota-endgame',
    );
  });

  test('reuses the campaign on X so one campaign spans channels', () => {
    const campaign = 'ep-24-quota-endgame';
    const linkedin = buildUtmUrl('https://show.shipshit.dev/ep24', {
      campaign,
      source: 'linkedin',
    });
    const x = buildUtmUrl('https://show.shipshit.dev/ep24', {
      campaign,
      source: 'x',
    });

    expect(new URL(linkedin ?? '').searchParams.get('utm_campaign')).toBe(
      campaign,
    );
    expect(new URL(x ?? '').searchParams.get('utm_campaign')).toBe(campaign);
    expect(new URL(x ?? '').searchParams.get('utm_source')).toBe('x');
  });

  test('preserves existing query and fragment', () => {
    const tagged = buildUtmUrl('https://show.shipshit.dev/ep24?ref=hn#notes', {
      campaign: 'ep-24-quota-endgame',
      source: 'linkedin',
    });

    expect(new URL(tagged ?? '').searchParams.get('ref')).toBe('hn');
    expect(new URL(tagged ?? '').hash).toBe('#notes');
  });

  test('is idempotent, so re-tagging never doubles a parameter', () => {
    const once = buildUtmUrl('https://show.shipshit.dev/ep24', {
      campaign: 'ep-24-quota-endgame',
      source: 'linkedin',
    });
    const twice = buildUtmUrl(once ?? '', {
      campaign: 'ep-24-quota-endgame',
      source: 'linkedin',
    });

    expect(twice).toBe(once);
  });

  test('returns null rather than publishing an untrackable link', () => {
    expect(
      buildUtmUrl('not a url', {
        campaign: 'ep-24-quota-endgame',
        source: 'linkedin',
      }),
    ).toBeNull();
    expect(
      buildUtmUrl('ftp://show.shipshit.dev/ep24', {
        campaign: 'ep-24-quota-endgame',
        source: 'linkedin',
      }),
    ).toBeNull();
    expect(
      buildUtmUrl('https://show.shipshit.dev/ep24', {
        campaign: 'not-a-campaign',
        source: 'linkedin',
      }),
    ).toBeNull();
  });
});
