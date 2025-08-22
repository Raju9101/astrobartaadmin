import Link from "next/link";
import { getAstrologers } from "@/lib/api";
import DashboardHeader from "@/components/dashboard/header";
import AstrologersTable from "@/components/dashboard/astrologers-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export const revalidate = 60;

export default async function AstrologersPage() {
  const astrologersData = await getAstrologers();

  return (
    <div>
      <DashboardHeader title="Astrologers">
        <Button asChild>
          <Link href="/astrologers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Astrologer
          </Link>
        </Button>
      </DashboardHeader>
      <AstrologersTable astrologers={astrologersData.data} />
    </div>
  );
}
