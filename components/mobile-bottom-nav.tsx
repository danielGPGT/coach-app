'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChartColumnStackedIcon,
  DumbbellIcon,
  HistoryIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP = {
  dashboard: ChartColumnStackedIcon,
  clients: UsersIcon,
  programs: DumbbellIcon,
  exercises: DumbbellIcon,
  history: HistoryIcon,
  settings: SettingsIcon,
} as const

const defaultNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', iconName: 'dashboard' },
  { href: '/clients', label: 'Clients', iconName: 'clients' },
  { href: '/programs', label: 'Programs', iconName: 'programs' },
  { href: '/exercises', label: 'Exercises', iconName: 'exercises' },
  { href: '/settings', label: 'Settings', iconName: 'settings' },
]

export type NavItem = { href: string; label: string; iconName: keyof typeof ICON_MAP }

type MobileBottomNavProps = {
  navItems?: NavItem[]
}

export function MobileBottomNav({ navItems = defaultNavItems }: MobileBottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className='fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden'
      aria-label='Main navigation'
    >
      {navItems.map(({ href, label, iconName }) => {
        const Icon = ICON_MAP[iconName]
        const isActive =
          pathname === href ||
          (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors tap-target',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className='size-5 shrink-0' aria-hidden />
            <span className='truncate'>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
