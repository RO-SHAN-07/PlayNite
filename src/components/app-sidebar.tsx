'use client';

import {
  Compass,
  Home,
  Library,
  Settings,
  Star,
  History,
  Brain,
  LogOut,
  LogIn,
  Video,
  Info,
  ListVideo,
  Rss,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';

const SIDEBAR_SECTIONS = [
  {
    label: 'Menu',
    items: [
      {
        href: '/',
        label: 'Home',
        icon: Home,
      },
      {
        href: '/explore',
        label: 'Explore',
        icon: Compass,
      },
      {
        href: '/feed',
        label: 'Feed',
        icon: Rss,
        authRequired: true,
      },
      {
        href: '/library',
        label: 'Library',
        icon: Library,
        authRequired: true,
      },
    ],
  },
  {
    label: 'My Library',
    items: [
      {
        href: '/library/history',
        label: 'History',
        icon: History,
      },
      {
        href: '/library/favorites',
        label: 'Favorites',
        icon: Star,
      },
       {
        href: '/library/playlists',
        label: 'Playlists',
        icon: ListVideo,
      },
      {
        href: '/library/memory-bank',
        label: 'Memory Bank',
        icon: Brain,
      },
    ],
    authRequired: true,
  },
   {
    label: 'Creator',
    items: [
      {
        href: '/studio',
        label: 'Creator Studio',
        icon: Video,
      },
    ],
    authRequired: true,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  if (isUserLoading) {
    return (
       <Sidebar
        className="border-r border-white/10 bg-black/30 backdrop-blur-xl"
        collapsible="icon"
      >
        <SidebarHeader>
           <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary-foreground"
                >
                  <path d="M7 4v16l13-8L7 4z"></path>
                </svg>
              </div>
              <span className="font-bold font-headline text-xl">PlayNite</span>
            </div>
        </SidebarHeader>
         <SidebarContent>
           <div className="p-2 space-y-4">
              <div className="space-y-2">
                <div className="h-6 w-1/2 bg-muted/20 animate-pulse rounded-md" />
                <div className="h-8 w-full bg-muted/20 animate-pulse rounded-md" />
                <div className="h-8 w-full bg-muted/20 animate-pulse rounded-md" />
                <div className="h-8 w-full bg-muted/20 animate-pulse rounded-md" />
              </div>
               <div className="space-y-2">
                <div className="h-6 w-1/2 bg-muted/20 animate-pulse rounded-md" />
                <div className="h-8 w-full bg-muted/20 animate-pulse rounded-md" />
                <div className="h-8 w-full bg-muted/20 animate-pulse rounded-md" />
              </div>
           </div>
        </SidebarContent>
         <SidebarFooter>
            <SidebarSeparator />
            <div className="p-2">
                <div className="h-8 w-full bg-muted/20 animate-pulse rounded-md" />
            </div>
        </SidebarFooter>
      </Sidebar>
    )
  }

  return (
    <Sidebar
      className="border-r border-white/10 bg-black/30 backdrop-blur-xl"
      collapsible="icon"
    >
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-foreground"
            >
              <path d="M7 4v16l13-8L7 4z"></path>
            </svg>
          </div>
          <span className="font-bold font-headline text-xl">PlayNite</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {SIDEBAR_SECTIONS.map((section) => (
         (section.authRequired && !user) ? null : (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => (
                 (item.authRequired && !user) ? null : (
                    <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={{ children: item.label }}
                    >
                        <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                 )
              ))}
            </SidebarMenu>
          </SidebarGroup>
         )
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarGroup>
          {user ? (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/account'}
                  tooltip={{ children: 'Account' }}
                >
                  <Link href="/account">
                    <Avatar className="h-6 w-6">
                      {user.photoURL && <AvatarImage src={user.photoURL} />}
                      <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{user.displayName || user.email}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <SidebarMenuButton
                  asChild
                  isActive={pathname === '/settings'}
                  tooltip={{ children: 'Settings' }}
                >
                  <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <SidebarMenuButton
                  asChild
                  isActive={pathname === '/about'}
                  tooltip={{ children: 'About' }}
                >
                  <Link href="/about">
                    <Info />
                    <span>About</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : (
            <SidebarMenu>
               <SidebarMenuItem>
                 <SidebarMenuButton
                  asChild
                  isActive={pathname === '/about'}
                  tooltip={{ children: 'About' }}
                >
                  <Link href="/about">
                    <Info />
                    <span>About</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                 <SidebarMenuButton asChild>
                  <Link href="/auth/login">
                    <LogIn />
                    <span>Log In</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
