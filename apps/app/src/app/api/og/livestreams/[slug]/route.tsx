import { ImageResponse } from 'next/og';
import { todayLocalDate } from '@/lib/date';
import { getTopicBySlug, resolveLivestreamDate } from '@/lib/livestreams-store';
import { clampText, stripMarkdown } from '@/lib/text';

export const runtime = 'nodejs';

function extractSummary(content: string): string | null {
  const match = content.match(/## Summary\n([\s\S]*?)(?:\n## |\n?$)/);
  if (!match) return null;

  const summary = stripMarkdown(match[1]).trim();
  return summary.length > 0 ? summary : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get('date') || todayLocalDate();
  const resolvedDate = await resolveLivestreamDate(requestedDate);
  const topic = await getTopicBySlug(resolvedDate, slug);

  const title = topic?.title || 'Ship Shit Show';
  const summary = clampText(
    extractSummary(topic?.content || '') ||
      'Livestream topic, talking points, and stream prep.',
    180,
  );
  const source = topic?.source || 'Livestream';

  return new ImageResponse(
    <div
      style={{
        alignItems: 'stretch',
        background:
          'linear-gradient(135deg, #17090d 0%, #0c0c0c 45%, #12161c 100%)',
        color: '#f3f3f3',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: '52px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          background:
            'radial-gradient(circle, rgba(255,90,95,0.22) 0%, rgba(255,90,95,0) 68%)',
          height: 520,
          position: 'absolute',
          right: -80,
          top: -100,
          width: 520,
        }}
      />

      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <div
          style={{
            color: '#ff5a5f',
            display: 'flex',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 5,
            textTransform: 'uppercase',
          }}
        >
          Ship Shit Show
        </div>
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999,
            color: '#d1d1d1',
            display: 'flex',
            fontSize: 20,
            padding: '10px 18px',
          }}
        >
          {resolvedDate}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: 980,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 70,
            fontWeight: 800,
            letterSpacing: -2.2,
            lineHeight: 1.03,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: '#d0d0d0',
            display: 'flex',
            fontSize: 28,
            lineHeight: 1.35,
          }}
        >
          {summary}
        </div>
      </div>

      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <div
          style={{
            color: '#a9a9a9',
            display: 'flex',
            fontSize: 22,
          }}
        >
          {source}
        </div>
        <div
          style={{
            backgroundColor: 'rgba(255,90,95,0.12)',
            borderRadius: 999,
            color: '#ffb8ba',
            display: 'flex',
            fontSize: 22,
            padding: '10px 18px',
          }}
        >
          live.shipshit.dev
        </div>
      </div>
    </div>,
    {
      height: 630,
      width: 1200,
    },
  );
}
