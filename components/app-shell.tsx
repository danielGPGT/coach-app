import Image from 'next/image'
import {
  ActivityIcon,
  BellIcon,
  ChartColumnStackedIcon,
  DumbbellIcon,
  HistoryIcon,
  LanguagesIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

import SearchDialog from '@/components/shadcn-studio/blocks/dialog-search'
import LanguageDropdown from '@/components/shadcn-studio/blocks/dropdown-language'
import ActivityDialog from '@/components/shadcn-studio/blocks/dialog-activity'
import NotificationDropdown from '@/components/shadcn-studio/blocks/dropdown-notification'
import AppShellProfile from '@/components/app-shell-profile'
import MenuSheet from '@/components/shadcn-studio/blocks/menu-sheet'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import type { NavigationSection } from '@/components/shadcn-studio/blocks/menu-sheet'
import LiftKitLogo from '@/public/liftkit-logo-v5.svg'

/** LIFTKIT-SPEC: Coach protected routes */
const coachNavigationData: NavigationSection[] = [
  { title: 'Dashboard', icon: <ChartColumnStackedIcon className='text-foreground size-4 shrink-0' />, href: '/dashboard' },
  { title: 'Clients', icon: <UsersIcon className='text-foreground size-4 shrink-0' />, href: '/clients' },
  { title: 'Programs', icon: <DumbbellIcon className='text-foreground size-4 shrink-0' />, href: '/programs' },
  { title: 'Exercises', icon: <DumbbellIcon className='text-foreground size-4 shrink-0' />, href: '/exercises' },
  { title: 'Settings', icon: <SettingsIcon className='text-foreground size-4 shrink-0' />, href: '/settings' },
]

/** Client: Dashboard, History, Settings */
const clientNavigationData: NavigationSection[] = [
  { title: 'Dashboard', icon: <ChartColumnStackedIcon className='text-foreground size-4 shrink-0' />, href: '/dashboard' },
  { title: 'History', icon: <HistoryIcon className='text-foreground size-4 shrink-0' />, href: '/history' },
  { title: 'Settings', icon: <SettingsIcon className='text-foreground size-4 shrink-0' />, href: '/settings' },
]

/** Serializable nav items for MobileBottomNav (server → client: no components). */
const coachNavItems = [
  { href: '/dashboard', label: 'Dashboard', iconName: 'dashboard' as const },
  { href: '/clients', label: 'Clients', iconName: 'clients' as const },
  { href: '/programs', label: 'Programs', iconName: 'programs' as const },
  { href: '/exercises', label: 'Exercises', iconName: 'exercises' as const },
  { href: '/settings', label: 'Settings', iconName: 'settings' as const },
]
const clientNavItems = [
  { href: '/dashboard', label: 'Dashboard', iconName: 'dashboard' as const },
  { href: '/history', label: 'History', iconName: 'history' as const },
  { href: '/settings', label: 'Settings', iconName: 'settings' as const },
]

type AppShellProps = {
  children: React.ReactNode
  role?: 'coach' | 'client'
  user?: { name: string; email: string; imageUrl?: string }
}

export function AppShell({ children, role = 'coach', user }: AppShellProps) {
  const isCoach = role === 'coach'
  const navigationData = isCoach ? coachNavigationData : clientNavigationData
  const navItems = isCoach ? coachNavItems : clientNavItems

  return (
    <div className='flex min-h-dvh flex-col'>
      <header className='bg-card sticky top-0 z-50 border-b'>
        <div className='border-b'>
          <div className='mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6'>
            <div className='flex items-center gap-4'>
              <MenuSheet
                logoName='CoachUp'
                navigationData={navigationData}
                trigger={
                  <Button variant='outline' size='icon' className='inline-flex md:hidden'>
                    <MenuIcon />
                    <span className='sr-only'>Menu</span>
                  </Button>
                }
              />
              <Link href='/dashboard' className='flex items-center gap-3'>
                <Image
                  src={LiftKitLogo}
                  alt='CoachUp logo'
                  className='h-9 w-auto'
                  priority
                />
                <span className='hidden text-xl font-semibold sm:block text-foreground'>CoachUp</span>
              </Link>
            </div>
            <SearchDialog
              className='hidden md:block'
              trigger={
                <Button variant='ghost' className='p-0 font-normal'>
                  <div className='text-muted-foreground flex min-w-55 items-center gap-1.5 rounded-md border px-3 py-2 text-sm'>
                    <SearchIcon />
                    <span>Type to search...</span>
                  </div>
                </Button>
              }
            />
            <div className='flex items-center gap-1.5'>
              <SearchDialog
                className='md:hidden'
                trigger={
                  <Button variant='ghost' size='icon'>
                    <SearchIcon />
                    <span className='sr-only'>Search</span>
                  </Button>
                }
              />
              <LanguageDropdown
                trigger={
                  <Button variant='ghost' size='icon'>
                    <LanguagesIcon />
                  </Button>
                }
              />
              <ActivityDialog
                trigger={
                  <Button variant='ghost' size='icon'>
                    <ActivityIcon />
                  </Button>
                }
              />
              <NotificationDropdown
                trigger={
                  <Button variant='ghost' size='icon' className='relative'>
                    <BellIcon />
                    <span className='bg-destructive absolute top-2 right-2.5 size-2 rounded-full' />
                  </Button>
                }
              />
              <ThemeToggle />
              <AppShellProfile user={user} />
            </div>
          </div>
        </div>
        <div className='mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-1.5 sm:px-6'>
          <NavigationMenu viewport={false} className='hidden md:block'>
            <NavigationMenuList className='flex-wrap justify-start'>
              {navigationData.map(navItem => {
                if (navItem.href) {
                  return (
                    <NavigationMenuItem key={navItem.title}>
                      <NavigationMenuLink
                        href={navItem.href}
                        className={cn(navigationMenuTriggerStyle(), 'flex flex-row items-center gap-1.5')}
                      >
                        {navItem.icon}
                        {navItem.title}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                }
                return (
                  <NavigationMenuItem key={navItem.title}>
                    <NavigationMenuTrigger className='gap-1.5'>
                      {navItem.icon}
                      {navItem.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className='data-[motion=from-start]:slide-in-from-left-30! data-[motion=to-start]:slide-out-to-left-30! data-[motion=from-end]:slide-in-from-right-30! data-[motion=to-end]:slide-out-to-right-30! absolute w-auto'>
                      <ul className='grid w-42 gap-4'>
                        <li>
                          {navItem.items?.map(item => (
                            <NavigationMenuLink
                              key={item.title}
                              href={item.href}
                              className='flex flex-row items-center gap-1.5'
                            >
                              {item.icon}
                              {item.title}
                            </NavigationMenuLink>
                          ))}
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )
              })}
            </NavigationMenuList>
          </NavigationMenu>
          {isCoach && (
            <Button asChild>
              <Link href='/clients?invite=1'>
                Invite client
                <PlusIcon />
              </Link>
            </Button>
          )}
        </div>
      </header>
      <main className='mx-auto size-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-6'>
        {children}
      </main>
      <MobileBottomNav navItems={navItems} />
      <footer className='max-md:pb-24 max-md:pt-4'>
        <div className='mx-auto flex size-full max-w-7xl items-center justify-between gap-3 p-4 max-md:flex-col sm:px-6'>
            <p className='text-muted-foreground text-center text-sm text-balance max-md:text-xs'>
            {`©${new Date().getFullYear()}`}{' '}
            <Link href='/dashboard' className='text-primary'>
              CoachUp
            </Link>
            , Strength coaching platform
          </p>
          <Breadcrumb className='max-md:hidden'>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href='/dashboard'>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>CoachUp</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </footer>
    </div>
  )
}
