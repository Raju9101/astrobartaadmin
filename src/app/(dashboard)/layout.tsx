'use client';

import AppSidebar from "@/components/dashboard/sidebar";
import MainHeader from "@/components/dashboard/main-header";
import { getBookings } from "@/lib/api";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import type { Booking } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Skeleton className="h-8 w-24" />
                    <div className="relative ml-auto flex-1 md:grow-0">
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                            <Skeleton className="h-32 rounded-lg" />
                            <Skeleton className="h-32 rounded-lg" />
                            <Skeleton className="h-32 rounded-lg" />
                            <Skeleton className="h-32 rounded-lg" />
                        </div>
                        <Skeleton className="h-96 w-full" />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            getBookings().then(data => {
                setBookings(data.bookings ?? []);
            });
        }
    }, [user]);

    if (authLoading || !user) {
        return <DashboardSkeleton />;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-1 flex-col">
                <MainHeader bookings={bookings} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/40">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
