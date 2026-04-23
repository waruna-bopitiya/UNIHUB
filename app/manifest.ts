import type { MetadataRoute } from 'next'

const siteName = 'Kuppi Site'
const siteDescription =
  'Kuppi Site is a peer-to-peer learning platform for university students to ask questions, join study groups, share resources, and learn together.'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteName,
    description: siteDescription,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f766e',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}