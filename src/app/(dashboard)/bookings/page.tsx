import { getBookings } from "@/lib/api";
import DashboardHeader from "@/components/dashboard/header";
import BookingsTable from "@/components/dashboard/bookings-table";

export const revalidate = 60; // Revalidate every minute

export default async function BookingsPage() {
  const bookingsData = await getBookings();

  return (
    <div>
      <DashboardHeader title="Manage Bookings" />
      <BookingsTable bookings={bookingsData.bookings} />
    </div>
  );
}
