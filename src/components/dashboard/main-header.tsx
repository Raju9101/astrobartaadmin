'use client';

import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { Booking } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';


interface MainHeaderProps {
  bookings: Booking[];
}

export default function MainHeader({ bookings }: MainHeaderProps) {
    const router = useRouter();
    const [unseenCount, setUnseenCount] = useState(0);
    
    const newBookings = useMemo(() => {
        if (!bookings) return [];
        const now = new Date();
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.booking_datetime);
            const diffHours = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);
            return diffHours <= 24;
        }).sort((a, b) => new Date(b.booking_datetime).getTime() - new Date(a.booking_datetime).getTime());
    }, [bookings]);

    useEffect(() => {
        const lastSeenTimestamp = localStorage.getItem('lastSeenBookingTimestamp');
        const seenTimestamp = lastSeenTimestamp ? new Date(lastSeenTimestamp).getTime() : 0;
        
        const unseen = newBookings.filter(b => new Date(b.booking_datetime).getTime() > seenTimestamp);
        setUnseenCount(unseen.length);
    }, [newBookings]);

    const handleNotificationOpen = () => {
        if (newBookings.length > 0) {
            const latestBookingTimestamp = newBookings[0].booking_datetime;
            localStorage.setItem('lastSeenBookingTimestamp', latestBookingTimestamp);
            setUnseenCount(0);
        }
    };
    
    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 shrink-0">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
            </div>
            
            <div className="flex items-center gap-4">
                <Popover onOpenChange={(open) => { if (open) handleNotificationOpen(); }}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative rounded-full">
                            <Bell className="h-5 w-5" />
                            {unseenCount > 0 && (
                                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground animate-pulse">
                                    {unseenCount}
                                </span>
                            )}
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-[350px] p-0">
                        <div className="p-2 border-b">
                            <h4 className="font-semibold px-2">Notifications</h4>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {newBookings.length > 0 ? (
                                newBookings.map(booking => (
                                    <Link key={booking.booking_id} href="/bookings" className="block">
                                      <div className="border-b p-3 text-sm hover:bg-accent">
                                          <p><span className="font-semibold">{booking.client_name}</span> booked a session.</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                              with {booking.astrologer_name} &middot; {formatDistanceToNow(new Date(booking.booking_datetime), { addSuffix: true })}
                                          </p>
                                      </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">No new notifications.</div>
                            )}
                        </div>
                         {newBookings.length > 0 && (
                            <div className="p-2 border-t">
                                <Button size="sm" variant="link" className="w-full" asChild>
                                    <Link href="/bookings">View all bookings</Link>
                                </Button>
                            </div>
                         )}
                    </PopoverContent>
                </Popover>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="person avatar" />
                                <AvatarFallback>
                                    <User />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Admin</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
