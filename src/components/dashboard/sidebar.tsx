'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Users, Sparkles, CalendarCheck, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/astrologers', label: 'Astrologers', icon: Users },
    { href: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { href: '/call-requests', label: 'Call Requests', icon: PhoneCall },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarHeader>
          <div className={cn("flex items-center gap-2 p-2", state === 'collapsed' && 'justify-center p-0')}>
            <div className={cn("p-2 rounded-lg bg-primary/20", state === 'collapsed' && 'p-1')}>
                <Sparkles className="text-primary-foreground" />
            </div>
            <h1 className={cn(
                "text-xl font-semibold font-headline text-primary-foreground",
                state === 'collapsed' && 'hidden'
            )}>AstroBarta</h1>
          </div>
        </SidebarHeader>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
