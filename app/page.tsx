import Link from 'next/link'

export default function Home() {
  return (
    <div className='flex min-h-dvh flex-col items-center justify-center gap-8 p-8'>
      <h1 className='text-3xl font-semibold'>LiftKit</h1>
      <p className='text-muted-foreground text-center'>
        Strength coaching platform. Sign in or create an account to continue.
      </p>
      <div className='flex flex-wrap items-center justify-center gap-4'>
        <Link
          href='/login'
          className='inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-primary-foreground font-medium transition-colors hover:bg-primary/90'
        >
          Log in
        </Link>
        <Link
          href='/signup'
          className='inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 font-medium transition-colors hover:bg-accent hover:text-accent-foreground'
        >
          Sign up
        </Link>
        <Link
          href='/dashboard'
          className='inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 font-medium transition-colors hover:bg-accent hover:text-accent-foreground'
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
