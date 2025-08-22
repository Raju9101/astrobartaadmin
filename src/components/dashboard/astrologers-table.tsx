'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Astrologer } from '@/lib/types';
import Link from 'next/link';
import { Edit, Trash2, Search } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';

interface AstrologersTableProps {
  astrologers: Astrologer[];
}

export default function AstrologersTable({ astrologers }: AstrologersTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredAstrologers = React.useMemo(() => {
    return astrologers.filter(astrologer =>
      astrologer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      astrologer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      astrologer.expertise.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [astrologers, searchTerm]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredAstrologers.length / ITEMS_PER_PAGE);

  const paginatedAstrologers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAstrologers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAstrologers, currentPage]);


  return (
    <Card>
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or expertise..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9 w-full md:w-1/2 lg:w-1/3"
          />
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Astrologer</TableHead>
              <TableHead>Expertise</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAstrologers.length > 0 ? (
              paginatedAstrologers.map((astrologer) => (
                <TableRow key={astrologer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={astrologer.profile_image ? `https://api.astrobarta.com${astrologer.profile_image}` : 'https://placehold.co/40x40.png'}
                        alt={astrologer.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        data-ai-hint="person portrait"
                      />
                      <div>
                        <div className="font-medium">{astrologer.name}</div>
                        <div className="text-sm text-muted-foreground">{astrologer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{astrologer.expertise}</Badge>
                  </TableCell>
                  <TableCell>{astrologer.experience} years</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/astrologers/edit/${astrologer.id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the astrologer profile.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No results found.
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
  );
}
