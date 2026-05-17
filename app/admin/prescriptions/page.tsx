import { apiRequest } from "@/lib/api-client";
import { PrescriptionList, PaginationControls } from "@/features/admin";
import { PageHeader } from "@/components/ui/page-header";

interface PrescriptionListItem {
  prescriptionId: number;
  appointmentId: number;
  patientName: string;
  doctorName: string;
  status: string;
  createdAt: string;
}

interface PrescriptionsResponse {
  content: PrescriptionListItem[];
  totalPages: number;
}

export default async function AdminPrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 0;
  const data = await apiRequest<PrescriptionsResponse>(
    `/prescription?page=${page}&size=5`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return (
    <div className="space-y-6 col-span-1 col-span-13">
      <PageHeader
        title="Prescriptions"
        description="Managing medical records"
      />

      <div className="rounded-3xl border border-border/60 bg-card/50 overflow-hidden shadow-sm">
        <PrescriptionList data={data.content} />
        <PaginationControls currentPage={page} totalPages={data.totalPages} />
      </div>
    </div>
  );
}
