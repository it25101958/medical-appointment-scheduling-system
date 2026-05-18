"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Calendar, Eye } from "lucide-react";
import {
  Badge,
  DataTable,
  type Column,
  Button,
  SearchBar,
} from "@/components/ui";
import { highlightText } from "@/lib/highlight-search";
import { apiRequest } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import { PrescriptionDetailsDialog } from "./prescription-details-dialog";
import type { PrescriptionResponse } from "@/types/prescription-types";

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

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function PrescriptionList({
  data = [],
  showSearch = true,
}: {
  data: PrescriptionListItem[];
  showSearch?: boolean;
}) {
  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionResponse | null>(null);
  const [loadingPrescriptionId, setLoadingPrescriptionId] = useState<
    number | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredPrescriptions = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return data;
    return data.filter((prescription) => {
      const haystack = [
        prescription.prescriptionId?.toString(),
        prescription.appointmentId?.toString(),
        prescription.patientName,
        prescription.doctorName,
        prescription.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [deferredSearchQuery, data]);

  const viewPrescription = useCallback(async (prescription: PrescriptionListItem) => {
    setLoadingPrescriptionId(prescription.prescriptionId);
    try {
      const details = await apiRequest<PrescriptionResponse>(
        `/prescription/${prescription.prescriptionId}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      setSelectedPrescription(details);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load prescription"));
    } finally {
      setLoadingPrescriptionId(null);
    }
  }, []);

  const columns: Column<PrescriptionListItem>[] = useMemo(
    () => [
      {
        header: "ID",
        render: (p) =>
          highlightText(
            p.prescriptionId?.toString() || "",
            deferredSearchQuery,
          ),
        className: "w-[120px] px-5 py-4 font-semibold text-foreground",
      },
      {
        header: "Appointment",
        render: (p) =>
          highlightText(p.appointmentId?.toString() || "", deferredSearchQuery),
      },
      {
        header: "Patient",
        render: (p) => highlightText(p.patientName || "", deferredSearchQuery),
      },
      {
        header: "Practitioner",
        render: (p) => highlightText(p.doctorName || "", deferredSearchQuery),
      },
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
      {
        header: "Actions",
        render: (p) => (
          <div className="flex items-center justify-center">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => viewPrescription(p)}
              aria-label="View prescription"
              title="View"
              disabled={loadingPrescriptionId === p.prescriptionId}
            >
              <Eye className="size-4" />
            </Button>
          </div>
        ),
        className: "w-[110px] px-5 py-4 text-center",
      },
    ],
    [deferredSearchQuery, loadingPrescriptionId, viewPrescription],
  );

  return (
    <>
      {showSearch && (
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by prescription, appointment, patient, doctor, or status"
          resultCount={filteredPrescriptions.length}
        />
      )}

      <div className={showSearch ? "mt-6" : ""}>
      <DataTable
        columns={columns}
        data={filteredPrescriptions}
        pageable={true}
        pageSize={10}
        showActions={false}
        minWidth="1080px"
        emptyMessage={
          loadingPrescriptionId
            ? `Loading prescription #${loadingPrescriptionId}...`
            : "No prescriptions found."
        }
      />
      </div>

      <PrescriptionDetailsDialog
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />
    </>
  );
}
