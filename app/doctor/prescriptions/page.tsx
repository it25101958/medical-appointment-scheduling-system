import { apiRequest } from "@/lib/api-client";
import { PrescriptionList } from "@/features/admin/components/prescription-list";
import { PaginationControls } from "@/features/admin/components/pagination-controls";

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

export default async function DoctorPrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 0;

  const data = await apiRequest<PrescriptionsResponse>(
    `/prescription/my?page=${page}&size=5`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return (
    <div className="space-y-6 col-span-1 col-span-13">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">My Prescriptions</h1>
        <p className="text-muted-foreground">Prescriptions issued by you</p>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/50 overflow-hidden shadow-sm">
        <PrescriptionList data={data.content} />
        <PaginationControls currentPage={page} totalPages={data.totalPages} />
      </div>
    </div>
  );
}
