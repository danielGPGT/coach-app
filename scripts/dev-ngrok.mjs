/**
 * Runs Next.js dev server and ngrok in parallel.
 * Ngrok uses @ngrok/ngrok (no binary, no PATH). Set NGROK_AUTHTOKEN in .env.local.
 * Use: npm run dev:ngrok
 */
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

config({ path: path.join(root, '.env.local') })

const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next')

// 1. Start Next.js dev server (no shell)
const dev = spawn(process.execPath, [nextBin, 'dev'], {
  cwd: root,
  stdio: 'inherit',
  shell: false,
  env: { ...process.env, FORCE_COLOR: '1' },
})

dev.on('error', (err) => {
  console.error('Next.js error:', err)
  process.exit(1)
})

// 2. Start ngrok via SDK (no binary needed)
let listener
try {
  const ngrok = await import('@ngrok/ngrok')
  listener = await ngrok.default.forward({
    addr: 3000,
    authtoken_from_env: true,
  })
  const url = listener.url()
  console.log('\n[ngrok] Tunnel active:', url)
  console.log('[ngrok] Webhook URL for Clerk:', `${url}/api/webhooks/clerk\n`)
} catch (err) {
  if (err.message?.includes('authtoken') || err.code === 'ERR_NGROK_102') {
    console.error(
      '\n[ngrok] Set NGROK_AUTHTOKEN. Get a free token at https://dashboard.ngrok.com/signup\n'
    )
  } else {
    console.error('[ngrok] Error:', err.message)
  }
  dev.kill()
  process.exit(1)
}

function shutdown() {
  if (listener) listener.close().catch(() => {})
  dev.kill()
  process.exit()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
