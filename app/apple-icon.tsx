import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #0f172a 0%, #1d4ed8 55%, #0f766e 100%)',
          color: '#ffffff',
          borderRadius: 40,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '18px 18px auto auto',
            width: 58,
            height: 58,
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.16)',
            filter: 'blur(2px)',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 118,
            height: 118,
            borderRadius: 34,
            border: '2px solid rgba(255,255,255,0.2)',
            background: 'rgba(15, 23, 42, 0.2)',
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: '-0.08em',
            boxShadow: '0 18px 50px rgba(15, 23, 42, 0.35)',
          }}
        >
          K
        </div>
      </div>
    ),
    size,
  )
}