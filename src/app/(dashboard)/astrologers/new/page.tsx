import DashboardHeader from "@/components/dashboard/header";
import AstrologerForm from "@/components/dashboard/astrologer-form";
import { getExpertise } from "@/lib/api";

export default async function NewAstrologerPage() {
  const expertise = await getExpertise();

  return (
    <div>
      <DashboardHeader title="Add New Astrologer" />
      <AstrologerForm expertise={expertise} />
    </div>
  );
}
