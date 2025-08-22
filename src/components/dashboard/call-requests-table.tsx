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
import { CallRequest } from '@/lib/types';
import { Search, Pencil, Eye, FileSpreadsheet, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type State, updateCallRequestStatus } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

interface CallRequestsTableProps {
  callRequests: CallRequest[];
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Updating...' : 'Update Status'}
        </Button>
    );
}

export default function CallRequestsTable({ callRequests }: CallRequestsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CallRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { toast } = useToast();
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useActionState(updateCallRequestStatus, initialState);
  
  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.errors || state.message?.includes('Error') ? 'destructive' : 'default',
        title: state.errors || state.message?.includes('Error') ? 'Error' : 'Success',
        description: state.message,
      });
      if (!state.errors && !state.message?.includes('Error')) {
        setIsDialogOpen(false);
        setSelectedRequest(null);
      }
    }
  }, [state, toast]);

  const handleUpdateClick = (request: CallRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const filteredCallRequests = React.useMemo(() => {
    if (!callRequests) return [];
    return callRequests.filter(request =>
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.note && request.note.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [callRequests, searchTerm]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredCallRequests.length / ITEMS_PER_PAGE);

  const paginatedCallRequests = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCallRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCallRequests, currentPage]);


  const getStatusVariant = (status: string | undefined): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status?.toLowerCase()) {
      case 'call completed':
      case 'call approve':
        return 'default';
      case 'call pending':
        return 'secondary';
      case 'cancelled':
      case 'call request can cancel':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const handleExportExcel = () => {
    const dataToExport = filteredCallRequests.map(req => ({
      'Client Name': req.name,
      'Phone': req.phone,
      'Note': req.note,
      'Status': req.status,
      'Remark': req.remark || 'N/A',
      'Request Date': format(new Date(req.call_request_date), 'PPpp'),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CallRequests');
    XLSX.writeFile(workbook, 'Call_Requests.xlsx');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    const tableColumn = ["Client Name", "Phone", "Note", "Status", "Remark", "Request Date"];
    const tableRows: any[] = [];

    filteredCallRequests.forEach(req => {
        const requestData = [
            req.name,
            req.phone,
            req.note || 'N/A',
            req.status,
            req.remark || 'N/A',
            format(new Date(req.call_request_date), 'PPpp'),
        ];
        tableRows.push(requestData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
    });
    doc.text("Call Requests", 14, 15);
    doc.save("Call_Requests.pdf");
};

  return (
    <>
      <Card>
        <div className="p-4 border-b flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="relative w-full md:w-1/2 lg:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search by name, phone, or note..."
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
                <TableHead>Note</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCallRequests.length > 0 ? (
                paginatedCallRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="font-medium">{request.name}</div>
                      <div className="text-sm text-muted-foreground">{request.phone}</div>
                    </TableCell>
                    <TableCell className="whitespace-normal break-words">{request.note}</TableCell>
                    <TableCell>{format(new Date(request.call_request_date), 'PPpp')}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(request.status)} className={`capitalize ${
                            request.status.toLowerCase() === 'call approve' ? 'bg-green-600 hover:bg-green-700 text-primary-foreground' : ''
                        }`}>
                          {request.status}
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
                              <DialogTitle>Call Request Details</DialogTitle>
                              <DialogDescription>
                                Full details for the call request from {request.name}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 text-sm">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="text-right font-medium col-span-1">Client:</span>
                                    <span className="col-span-3">{request.name}</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="text-right font-medium col-span-1">Phone:</span>
                                    <span className="col-span-3">{request.phone}</span>
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <span className="text-right font-medium col-span-1">Note:</span>
                                    <span className="col-span-3">{request.note}</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="text-right font-medium col-span-1">Status:</span>
                                    <span className="col-span-3 capitalize">{request.status}</span>
                                </div>
                                {request.remark && (
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <span className="text-right font-medium col-span-1">Remark:</span>
                                        <span className="col-span-3">{request.remark}</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="text-right font-medium col-span-1">Requested:</span>
                                    <span className="col-span-3">{format(new Date(request.call_request_date), 'PPpp')}</span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="text-right font-medium col-span-1">Updated:</span>
                                    <span className="col-span-3">{format(new Date(request.status_updated_at), 'PPpp')}</span>
                                </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateClick(request)} disabled={request.status.toLowerCase() !== 'call pending'}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Update Status</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No call requests found.
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
            setSelectedRequest(null);
        }
        setIsDialogOpen(open);
      }}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Update Call Request Status</DialogTitle>
                  <DialogDescription>
                      Update the status for the call request from {selectedRequest?.name}. A remark is required.
                  </DialogDescription>
              </DialogHeader>
              <form action={dispatch}>
                  <input type="hidden" name="id" value={selectedRequest?.id || ''} />
                  <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">New Status</Label>
                        <Select name="status" required>
                            <SelectTrigger aria-describedby="status-error">
                                <SelectValue placeholder="Select a new status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="call completed">Call Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                         <div id="status-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.status && <p className="text-sm text-destructive">{state.errors.status[0]}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="remark">Remark</Label>
                          <Textarea id="remark" name="remark" placeholder="Provide a required remark for the status change." required aria-describedby="remark-error" />
                          <div id="remark-error" aria-live="polite" aria-atomic="true">
                            {state.errors?.remark && <p className="text-sm text-destructive">{state.errors.remark[0]}</p>}
                          </div>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <SubmitButton />
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </>
  );
}
