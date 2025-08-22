'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Astrologer, Booking } from "@/lib/types";
import { Users, UserPlus, Calendar, CalendarCheck, CalendarDays } from "lucide-react";
import { useMemo } from "react";

interface StatsCardsProps {
  astrologers: Astrologer[];
  bookings: Booking[];
}

export default function StatsCards({ astrologers, bookings }: StatsCardsProps) {
  const stats = useMemo(() => {
    const totalAstrologers = astrologers.length;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    const currentMonthString = `${year}-${month}`;

    const newThisMonth = astrologers.filter(a => {
      return a.register_date && a.register_date.startsWith(currentMonthString);
    }).length;

    const averageExperience = totalAstrologers > 0 
      ? (astrologers.reduce((acc, a) => acc + (parseInt(a.experience, 10) || 0), 0) / totalAstrologers).toFixed(1)
      : '0.0';

    const todaysBookings = bookings.filter(b => b.session_book_date === todayString).length;

    const monthlyBookings = bookings.filter(b => {
      return b.session_book_date && b.session_book_date.startsWith(currentMonthString);
    }).length;

    return [
      {
        title: "Total Astrologers",
        value: totalAstrologers,
        icon: Users,
        color: "text-chart-1",
        bgColor: "bg-chart-1/10",
      },
      {
        title: "New This Month",
        value: newThisMonth,
        icon: UserPlus,
        color: "text-chart-2",
        bgColor: "bg-chart-2/10",
      },
      {
        title: "Average Experience",
        value: `${averageExperience} yrs`,
        icon: Calendar,
        color: "text-chart-3",
        bgColor: "bg-chart-3/10",
      },
      {
        title: "Today's Bookings",
        value: todaysBookings,
        icon: CalendarCheck,
        color: "text-chart-4",
        bgColor: "bg-chart-4/10",
      },
      {
        title: "This Month's Bookings",
        value: monthlyBookings,
        icon: CalendarDays,
        color: "text-chart-5",
        bgColor: "bg-chart-5/10",
      }
    ];
  }, [astrologers, bookings]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
