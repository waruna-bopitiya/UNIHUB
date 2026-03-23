/**
 * YouTube Data API v3 – server-side client
 *
 * HOW TO GET YOUR OAUTH CREDENTIALS (one-time setup):
 * ─────────────────────────────────────────────────────
 * 1. Go to https://console.cloud.google.com/ and create/select your project.
 * 2. Enable the "YouTube Data API v3" from the API library.
 * 3. Go to "OAuth consent screen" → configure it (External, add your email as
 *    a test user while in development).
 * 4. Go to "Credentials" → Create Credentials → OAuth 2.0 Client ID →
 *    Application type: "Web application".
 *    Add  http://localhost:3000  as an Authorised JavaScript origin.
 *    Add  http://localhost:3000/api/auth/youtube/callback  as a redirect URI.
 * 5. Copy the Client ID and Client Secret into .env.local.
 * 6. Run the one-time token script to get your refresh token:
 *       npx ts-node --skip-project scripts/get-youtube-token.ts
 *    (or run the JS version if you don't have ts-node)
 * 7. Paste the printed refresh_token into YOUTUBE_REFRESH_TOKEN in .env.local.
 *
 * After that the server can create live broadcasts on your channel forever
 * without any user-facing login step.
 */

import { google } from 'googleapis'

export function getYouTubeClient() {
  if (
    !process.env.YOUTUBE_CLIENT_ID ||
    !process.env.YOUTUBE_CLIENT_SECRET ||
    !process.env.YOUTUBE_REFRESH_TOKEN
  ) {
    throw new Error(
      'YouTube OAuth credentials are not configured. ' +
        'Set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, and YOUTUBE_REFRESH_TOKEN in .env.local. ' +
        'See lib/youtube.ts for setup instructions.'
    )
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  })

  return google.youtube({ version: 'v3', auth: oauth2Client })
}

/** Read-only client using API key – for fetching public stream data */
export function getYouTubePublicClient() {
  return google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  })
}
