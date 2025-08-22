import { getAstrologers, getBookings } from "@/lib/api";
import DashboardHeader from "@/components/dashboard/header";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentBookings from "@/components/dashboard/recent-bookings";

export const revalidate = 60; // Revalidate data every 60 seconds

export default async function DashboardPage() {
  const [astrologersData, bookingsData] = await Promise.all([
    getAstrologers(),
    getBookings(),
  ]);

  const recentBookings = (bookingsData.bookings || [])
    .sort((a, b) => new Date(b.booking_datetime).getTime() - new Date(a.booking_datetime).getTime())
    .slice(0, 5);
  
  return (
    <div>
      <DashboardHeader title="Dashboard" />
      <StatsCards astrologers={astrologersData.data} bookings={bookingsData.bookings || []} />
      <div className="mt-8">
        <RecentBookings bookings={recentBookings} />
      </div>
    </div>
  );
}
