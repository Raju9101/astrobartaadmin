import DashboardHeader from "@/components/dashboard/header";
import AstrologerForm from "@/components/dashboard/astrologer-form";
import { getExpertise, getAstrologers } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function EditAstrologerPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  const [expertise, astrologersData] = await Promise.all([
    getExpertise(),
    getAstrologers(),
  ]);

  const astrologer = astrologersData.data.find(a => a.id === id);

  if (!astrologer) {
    notFound();
  }
  
  return (
    <div>
      <DashboardHeader title="Edit Astrologer" />
      <AstrologerForm expertise={expertise} astrologer={astrologer} />
    </div>
  );
}
