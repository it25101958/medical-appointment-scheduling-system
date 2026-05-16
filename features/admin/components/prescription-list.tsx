"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Badge, DataTable, type Column } from "@/components/ui";
import { PrescriptionDetailsDialog } from "./prescription-details-dialog";
import { Prescription as FullPrescription } from "@/lib/services/prescription-service";

interface PrescriptionListItem {
  prescriptionId: number;
  appointmentId: number;
  patientName: string;
  doctorName: string;
  status: string;
  createdAt: string;
}

function getStatusBadgeClasses(status: string) {
  switch (status.trim().toLowerCase()) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "cancelled":
    case "canceled":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "draft":
      return "border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border-sky-200 bg-sky-50 text-sky-700";
  }
}

export function PrescriptionList({
  data = [],
}: {
  data: PrescriptionListItem[];
}) {
  const [selectedPrescription, setSelectedPrescription] =
    useState<FullPrescription | null>(null);

  const columns: Column<PrescriptionListItem>[] = [
    {
      header: "ID",
      accessor: "prescriptionId",
      className: "w-[120px] px-5 py-4 font-semibold text-foreground",
    },
    { header: "Appointment", accessor: "appointmentId" },
    { header: "Patient", accessor: "patientName" },
    { header: "Practitioner", accessor: "doctorName" },
    {
      header: "Status",
      render: (p: PrescriptionListItem) => (
        <Badge
          variant="outline"
          className={`rounded-full px-3 py-0.5 text-[11px] font-medium ${getStatusBadgeClasses(
            p.status,
          )}`}
        >
          {p.status}
        </Badge>
      ),
    },
    {
      header: "Created",
      render: (p: PrescriptionListItem) => (
        <div className="flex items-center justify-end gap-2 text-muted-foreground">
          <Calendar className="size-3" />
          {new Date(p.createdAt).toLocaleDateString()}
        </div>
      ),
      className: "px-5 py-4 text-right",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        onView={(p) =>
          setSelectedPrescription(p as unknown as FullPrescription)
        }
        pageable={true}
        pageSize={10}
        showActions={true}
        emptyMessage="No prescriptions found."
      />

      <PrescriptionDetailsDialog
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />
    </>
  );
}
