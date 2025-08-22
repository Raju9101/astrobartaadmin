'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/lib/types';
import { format } from 'date-fns';

interface RecentBookingsProps {
  bookings: Booking[];
}

export default function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>
          Here are the last 5 bookings made in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden sm:table-cell">Astrologer</TableHead>
                <TableHead className="hidden md:table-cell">Session Date</TableHead>
                <TableHead className="text-right">Booked On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.booking_id}>
                    <TableCell>
                      <div className="font-medium">{booking.client_name}</div>
                      <div className="text-sm text-muted-foreground hidden sm:block">
                        {booking.client_email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{booking.astrologer_name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {booking.session_book_date}
                    </TableCell>
                    <TableCell className="text-right">
                      {format(new Date(booking.booking_datetime), 'PP')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No recent bookings.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
