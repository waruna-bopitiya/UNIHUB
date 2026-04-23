import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const siteName = 'Kuppi Site'
const siteDescription =
  'Peer-to-peer learning for university students.'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background:
            'radial-gradient(circle at top left, rgba(56, 189, 248, 0.35), transparent 34%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #0f766e 100%)',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.18)',
              fontSize: 62,
              fontWeight: 800,
            }}
          >
            K
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.04em' }}>
              {siteName}
            </div>
            <div style={{ fontSize: 24, opacity: 0.8 }}>
              Peer-to-peer learning platform
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 820 }}>
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}>
            Study together. Share faster. Learn better.
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.35, color: 'rgba(255,255,255,0.82)' }}>
            {siteDescription}
          </div>
        </div>
      </div>
    ),
    size,
  )
}