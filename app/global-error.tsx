'use client'

/**
 * Catches errors in the root layout (ClerkProvider, ThemeProvider, etc.).
 * Must include <html> and <body> - replaces root layout when active.
 * Only runs in production; dev uses Next.js error overlay.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang='en'>
      <body className='flex min-h-dvh flex-col items-center justify-center p-6 antialiased'>
        <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            A critical error occurred. Please refresh the page or try again later.
          </p>
          {error.digest && (
            <p style={{ marginTop: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#6b7280' }}>
              Error ID: {error.digest}
            </p>
          )}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.5rem 1rem',
                background: '#18181b',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Try again
            </button>
            <a
              href='/'
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #e4e4e7',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: '#18181b'
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
