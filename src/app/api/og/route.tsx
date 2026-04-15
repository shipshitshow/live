import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'stretch',
        background:
          'radial-gradient(circle at top left, #2b0f18 0%, #14090d 45%, #090909 100%)',
        color: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: '56px',
        width: '100%',
      }}
    >
      <div
        style={{
          color: '#ff5a5f',
          display: 'flex',
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: 'uppercase',
        }}
      >
        Ship Shit Show
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.02,
            maxWidth: 920,
          }}
        >
          Livestream prep, analytics, and show ops.
        </div>

        <div
          style={{
            color: '#c8c8c8',
            display: 'flex',
            fontSize: 30,
            lineHeight: 1.35,
            maxWidth: 860,
          }}
        >
          Deep-dive topics, YouTube context, timeline cues, and links for every
          Ship Shit Show livestream.
        </div>
      </div>

      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: 14,
        }}
      >
        <div
          style={{
            backgroundColor: '#ff5a5f',
            borderRadius: 999,
            display: 'flex',
            height: 12,
            width: 12,
          }}
        />
        <div
          style={{
            color: '#b0b0b0',
            display: 'flex',
            fontSize: 24,
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
