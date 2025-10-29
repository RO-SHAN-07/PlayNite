'use client';

import {
  Compass,
  Home,
  Library,
  Settings,
  User,
  Star,
  History,
  LogOut,
  LogIn,
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
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
        href: '/library',
        label: 'Library',
        icon: Library,
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
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const avatarImage = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');
  // Mock signed-in state
  const isSignedIn = true;

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
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={{ children: item.label }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarGroup>
          {isSignedIn ? (
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/account" passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === '/account'}
                    tooltip={{ children: 'Account' }}
                  >
                    <Avatar className="h-6 w-6">
                      {avatarImage && <AvatarImage src={avatarImage.imageUrl} data-ai-hint={avatarImage.imageHint} />}
                      <AvatarFallback>PN</AvatarFallback>
                    </Avatar>
                    <span>Jane Doe</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/settings" passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === '/settings'}
                    tooltip={{ children: 'Settings' }}
                  >
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/auth/login" passHref legacyBehavior>
                  <SidebarMenuButton>
                    <LogOut />
                    <span>Log Out</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : (
            <SidebarMenu>
               <SidebarMenuItem>
                <Link href="/auth/login" passHref legacyBehavior>
                  <SidebarMenuButton>
                    <LogIn />
                    <span>Log In</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
