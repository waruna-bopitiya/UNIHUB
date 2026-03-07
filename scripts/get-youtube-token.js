/**
 * One-time script to generate a YouTube OAuth refresh token.
 *
 * Usage:
 *   1. Fill in CLIENT_ID and CLIENT_SECRET below (or set them as env vars).
 *   2. Run:  node scripts/get-youtube-token.js
 *   3. Open the printed URL in your browser, sign in with the YouTube channel
 *      owner account, and approve the permissions.
 *   4. Copy the "code" query parameter from the redirect URL.
 *   5. Paste it when prompted.
 *   6. Copy the printed refresh_token into YOUTUBE_REFRESH_TOKEN in .env.local.
 */

const { google } = require('googleapis')
const readline = require('readline')

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || 'PASTE_YOUR_CLIENT_ID_HERE'
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || 'PASTE_YOUR_CLIENT_SECRET_HERE'
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob' // For CLI – no redirect server needed

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const SCOPES = ['https://www.googleapis.com/auth/youtube']

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // Forces refresh_token to be returned every time
})

console.log('\n──────────────────────────────────────────────────────────')
console.log('1. Open this URL in your browser (use the CHANNEL OWNER account):')
console.log('\n' + authUrl + '\n')
console.log('──────────────────────────────────────────────────────────\n')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

rl.question('2. Paste the authorisation code here: ', async (code) => {
  rl.close()
  try {
    const { tokens } = await oauth2Client.getToken(code.trim())
    console.log('\n✅  Success! Add this to your .env.local:\n')
    console.log('YOUTUBE_REFRESH_TOKEN=' + tokens.refresh_token)
    console.log('\nKeep this value secret — it gives full access to the channel.')
  } catch (err) {
    console.error('Failed to exchange code for tokens:', err.message)
  }
})
