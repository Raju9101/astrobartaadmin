import { getCallRequests } from "@/lib/api";
import DashboardHeader from "@/components/dashboard/header";
import CallRequestsTable from "@/components/dashboard/call-requests-table";

export const revalidate = 60; // Revalidate every minute

export default async function CallRequestsPage() {
  const callRequestsData = await getCallRequests();

  return (
    <div>
      <DashboardHeader title="Call Requests" />
      <CallRequestsTable callRequests={callRequestsData.data || []} />
    </div>
  );
}
