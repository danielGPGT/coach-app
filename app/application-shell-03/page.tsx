import {
  ActivityIcon,
  BellIcon,
  BookUserIcon,
  ChartColumnStackedIcon,
  LanguagesIcon,
  LifeBuoyIcon,
  ListChecksIcon,
  ListTodoIcon,
  MenuIcon,
  MessageSquareMoreIcon,
  PlusIcon,
  SearchIcon,
  SquareCheckBigIcon,
  TextSearchIcon,
  UserCheckIcon,
  UserIcon,
  UsersIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

import LogoSvg from '@/assets/svg/logo'
import SearchDialog from '@/components/shadcn-studio/blocks/dialog-search'
import LanguageDropdown from '@/components/shadcn-studio/blocks/dropdown-language'
import ActivityDialog from '@/components/shadcn-studio/blocks/dialog-activity'
import NotificationDropdown from '@/components/shadcn-studio/blocks/dropdown-notification'
import ProfileDropdown from '@/components/shadcn-studio/blocks/dropdown-profile'
import MenuSheet from '@/components/shadcn-studio/blocks/menu-sheet'
import type { NavigationSection } from '@/components/shadcn-studio/blocks/menu-sheet'

const navigationData: NavigationSection[] = [
  {
    title: 'Dashboard',
    icon: <ChartColumnStackedIcon className='text-foreground size-4 shrink-0' />,
    href: '#'
  },
  {
    title: 'Tasks',
    icon: <ListTodoIcon className='text-foreground size-4 shrink-0' />,
    items: [
      { title: 'All Tasks', href: '#', icon: <SquareCheckBigIcon className='text-foreground size-4 shrink-0' /> },
      { title: 'My Tasks', href: '#', icon: <UserCheckIcon className='text-foreground size-4 shrink-0' /> },
      { title: 'Completed Tasks', href: '#', icon: <ListChecksIcon className='text-foreground size-4 shrink-0' /> }
    ]
  },
  {
    title: 'Customers',
    icon: <UsersIcon className='text-foreground size-4 shrink-0' />,
    items: [
      { title: 'All Customers', href: '#', icon: <UsersIcon className='text-foreground size-4 shrink-0' /> },
      { title: 'New Customer', href: '#', icon: <UserIcon className='text-foreground size-4 shrink-0' /> },
      { title: 'Customer Groups', href: '#', icon: <BookUserIcon className='text-foreground size-4 shrink-0' /> },
      {
        title: 'Customer Feedback',
        href: '#',
        icon: <MessageSquareMoreIcon className='text-foreground size-4 shrink-0' />
      },
      { title: 'Customer Support', href: '#', icon: <LifeBuoyIcon className='text-foreground size-4 shrink-0' /> }
    ]
  },
  {
    title: 'Search',
    icon: <TextSearchIcon className='text-foreground size-4 shrink-0' />,
    href: '#'
  }
]

const ApplicationShell = () => {
  return (
    <div className='flex min-h-dvh flex-col'>
      <header className='bg-card sticky top-0 z-50 border-b'>
        <div className='border-b'>
          <div className='mx-auto flex container items-center justify-between gap-8 px-4 py-3 sm:px-6'>
            <div className='flex items-center gap-4'>
              <MenuSheet
                logoName='CRM'
                navigationData={navigationData}
                trigger={
                  <Button variant='outline' size='icon' className='inline-flex md:hidden'>
                    <MenuIcon />
                    <span className='sr-only'>Menu</span>
                  </Button>
                }
              />
              <a href='#'>
                <div className='flex items-center'>
                  <LogoSvg className='size-8.5' />
                  <span className='ml-2.5 hidden text-xl font-semibold sm:block'>CRM</span>
                </div>
              </a>
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
              <ProfileDropdown
                trigger={
                  <Button variant='ghost' className='h-full p-0'>
                    <Avatar className='size-9.5 rounded-md'>
                      <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
            </div>
          </div>
        </div>
        <div className='mx-auto flex container items-center justify-between gap-8 px-4 py-1.5 sm:px-6'>
          <NavigationMenu viewport={false} className='hidden md:block'>
            <NavigationMenuList className='flex-wrap justify-start'>
              {navigationData.map(navItem => {
                if (navItem.href) {
                  // Root link item
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

                // Section with dropdown
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
          <Button>
            Invite Members
            <PlusIcon />
          </Button>
        </div>
      </header>
      <main className='mx-auto size-full container flex-1 px-4 py-6 sm:px-6'>
        <Card className='h-250'>
          <CardContent className='h-full'>
            <div className='h-full rounded-md border bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_1px,var(--card)_2px,var(--card)_15px)]' />
          </CardContent>
        </Card>
      </main>
      <footer>
        <div className='mx-auto flex size-full container items-center justify-between gap-3 p-4 max-md:flex-col sm:px-6'>
          <p className='text-muted-foreground text-center text-sm text-balance'>
            {`©${new Date().getFullYear()}`}{' '}
            <a href='#' className='text-primary'>
              shadcn/studio
            </a>
            , Made for better web design
          </p>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href='#'>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href='#'>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>CRM</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </footer>
    </div>
  )
}

export default ApplicationShell
