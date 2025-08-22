'use client';

import * as React from 'react';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Booking } from '@/lib/types';
import { Eye, Search, CheckCircle, XCircle, FileSpreadsheet, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type State, updateBookingStatus } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';


interface BookingsTableProps {
  bookings: Booking[];
}

interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

function SubmitButton({ actionType }: { actionType: 'accepted' | 'cancelled' | null }) {
    const { pending } = useFormStatus();
    const text = actionType === 'accepted' ? 'Approve' : 'Reject';
    return (
        <Button type="submit" disabled={pending} variant={actionType === 'cancelled' ? 'destructive' : 'default'}>
            {pending ? 'Submitting...' : text}
        </Button>
    );
}

export default function BookingsTable({ bookings }: BookingsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<'accepted' | 'cancelled' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { toast } = useToast();
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useActionState(updateBookingStatus, initialState);
  
  useEffect(() => {
    if (state.message) {
      toast({
        variant: state.errors || state.message?.includes('Error') ? 'destructive' : 'default',
        title: state.errors || state.message?.includes('Error') ? 'Error' : 'Success',
        description: state.message,
      });
      if (!state.errors && !state.message?.includes('Error')) {
        setIsDialogOpen(false);
        setSelectedBooking(null);
        setActionType(null);
      }
    }
  }, [state, toast]);

  const handleActionClick = (booking: Booking, type: 'accepted' | 'cancelled') => {
    setSelectedBooking(booking);
    setActionType(type);
    setIsDialogOpen(true);
  };

  const filteredBookings = React.useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(booking =>
      booking.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.astrologer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  const paginatedBookings = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  const handleExportExcel = () => {
    const dataToExport = filteredBookings.map(booking => ({
      'Client Name': booking.client_name,
      'Client Email': booking.client_email,
      'Astrologer': booking.astrologer_name,
      'Session': `${booking.session_book_date} at ${booking.session_book_time}`,
      'Status': booking.booking_status || 'pending',
      'Booked On': format(new Date(booking.booking_datetime), 'PPpp'),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, 'Bookings.xlsx');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    const tableColumn = ["Client Name", "Client Email", "Astrologer", "Session", "Status", "Booked On"];
    const tableRows: any[] = [];

    filteredBookings.forEach(booking => {
        const bookingData = [
            booking.client_name,
            booking.client_email,
            booking.astrologer_name,
            `${booking.session_book_date} at ${booking.session_book_time}`,
            booking.booking_status || 'pending',
            format(new Date(booking.booking_datetime), 'PPpp'),
        ];
        tableRows.push(bookingData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
    });
    doc.text("Bookings Data", 14, 15);
    doc.save("Bookings.pdf");
  };

  return (
    <>
      <Card>
        <div className="p-4 border-b flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="relative w-full md:w-1/2 lg:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search by client or astrologer name/email..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9 w-full"
                />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Button onClick={handleExportExcel} variant="outline" size="sm" className="w-full md:w-auto">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                </Button>
                <Button onClick={handleExportPdf} variant="outline" size="sm" className="w-full md:w-auto">
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                </Button>
            </div>
        </div>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Astrologer</TableHead>
                <TableHead>Session Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.length > 0 ? (
                paginatedBookings.map((booking) => (
                  <TableRow key={booking.booking_id}>
                    <TableCell>
                      <div className="font-medium">{booking.client_name}</div>
                      <div className="text-sm text-muted-foreground">{booking.client_email}</div>
                    </TableCell>
                    <TableCell>{booking.astrologer_name}</TableCell>
                    <TableCell>{booking.session_book_date} at {booking.session_book_time}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.booking_status === 'cancelled'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className={`capitalize ${
                          booking.booking_status === 'accepted'
                            ? 'bg-green-600 hover:bg-green-700 border-transparent text-primary-foreground'
                            : ''
                        }`}
                      >
                        {booking.booking_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                              <DialogDescription>
                                Full details for the booking by {booking.client_name}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 text-sm">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium col-span-1">Client:</span>
                                <span className="col-span-3">{booking.client_name} ({booking.client_email})</span>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium col-span-1">Phone:</span>
                                <span className="col-span-3">{booking.phone_number}</span>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium col-span-1">Address:</span>
                                <span className="col-span-3">{booking.address}</span>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium col-span-1">Astrologer:</span>
                                <span className="col-span-3">{booking.astrologer_name}</span>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium col-span-1">Session:</span>
                                <span className="col-span-3">{booking.session_book_date} at {booking.session_book_time}</span>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium col-span-1">Booked On:</span>
                                <span className="col-span-3">{new Date(booking.booking_datetime).toLocaleString()}</span>
                              </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium col-span-1">Status:</span>
                                <span className="col-span-3 capitalize">{booking.booking_status || 'pending'}</span>
                              </div>
                                {booking.remarks && (
                                <div className="grid grid-cols-4 items-start gap-4">
                                  <span className="text-right font-medium col-span-1">Remarks:</span>
                                  <span className="col-span-3">{booking.remarks}</span>
                                </div>
                                )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={() => handleActionClick(booking, 'accepted')} disabled={booking.booking_status && booking.booking_status !== 'pending'} className="transition-transform duration-200 ease-in-out hover:scale-110">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="sr-only">Approve</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleActionClick(booking, 'cancelled')} disabled={booking.booking_status && booking.booking_status !== 'pending'} className="transition-transform duration-200 ease-in-out hover:scale-110">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Reject</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages > 0 ? totalPages : 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>
                      {actionType === 'accepted' ? 'Approve Booking' : 'Reject Booking'}
                  </DialogTitle>
                  <DialogDescription>
                      {actionType === 'accepted' 
                          ? `You are about to approve the booking for ${selectedBooking?.client_name}.`
                          : `You are about to reject the booking for ${selectedBooking?.client_name}.`
                      }
                      Add any remarks below.
                  </DialogDescription>
              </DialogHeader>
              <form action={dispatch}>
                  <input type="hidden" name="id" value={selectedBooking?.booking_id || ''} />
                  <input type="hidden" name="status" value={actionType || ''} />
                  <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                          <Label htmlFor="remarks">Remarks</Label>
                          <Textarea id="remarks" name="remarks" placeholder="Provide a reason or remarks (optional for approval, recommended for rejection)" />
                          {state.errors?.remarks && <p className="text-sm text-destructive">{state.errors.remarks[0]}</p>}
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <SubmitButton actionType={actionType} />
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </>
  );
}
