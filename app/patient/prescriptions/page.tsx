import { apiRequest } from "@/lib/api-client";
import { PrescriptionList } from "@/features/admin/components/prescription-list";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { PageHeader } from "@/components/ui";

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

export default async function PatientPrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 0;

  let data: PrescriptionsResponse = {
    content: [],
    totalPages: 0,
  };
  let errorMessage = "";

  try {
    data = await apiRequest<PrescriptionsResponse>(
      `/prescription/my?page=${page}&size=5`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Could not load prescriptions";
  }

  return (
    <div className="space-y-6 col-start-1 col-end-14">
      <PageHeader
        title="My Prescriptions"
        description="View prescriptions issued by your doctor and open each record for medication details."
      />

      {errorMessage ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          {errorMessage}
        </div>
      ) : (
        <>
          <PrescriptionList data={data.content || []} />
          <PaginationControls currentPage={page} totalPages={data.totalPages} />
        </>
      )}
    </div>
  );
}
