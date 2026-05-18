"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CalendarDays, Eye, Pill, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import {
  Badge,
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  PageHeader,
  SearchBar,
  type Column,
} from "@/components/ui";
import { apiRequest } from "@/lib/api-client";
import { highlightText } from "@/lib/highlight-search";
import { getErrorMessage } from "@/lib/utils";
import type {
  PrescriptionItemResponse,
  PrescriptionResponse,
} from "@/types/prescription-types";

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

interface PatientMedicationRow extends PrescriptionItemResponse {
  prescriptionId: number;
  appointmentId: number;
  doctorName: string;
  status: string;
  prescriptionDate?: string;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function PatientMedicationsPage() {
  const [medications, setMedications] = useState<PatientMedicationRow[]>([]);
  const [selectedMedication, setSelectedMedication] =
    useState<PatientMedicationRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  async function loadMedications() {
    setLoading(true);
    try {
      const prescriptions = await apiRequest<PrescriptionsResponse>(
        "/prescription/my?page=0&size=50",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const details = await Promise.all(
        (prescriptions.content || []).map((prescription) =>
          apiRequest<PrescriptionResponse>(
            `/prescription/${prescription.prescriptionId}`,
            {
              method: "GET",
              cache: "no-store",
            },
          ).catch(() => null),
        ),
      );

      const rows = details
        .filter((prescription): prescription is PrescriptionResponse =>
          Boolean(prescription),
        )
        .flatMap((prescription) =>
          (prescription.items || []).map((item) => ({
            ...item,
            prescriptionId: prescription.prescriptionId,
            appointmentId: prescription.appointmentId,
            doctorName: prescription.doctorName,
            status: prescription.status,
            prescriptionDate: prescription.prescriptionDate,
          })),
        );

      setMedications(rows);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load medications"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedications();
  }, []);

  const filteredMedications = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return medications;

    return medications.filter((medication) => {
      const haystack = [
        medication.medicationName,
        medication.genericName,
        medication.dosage,
        medication.quantity?.toString(),
        medication.specialInstructions,
        medication.prescriptionId?.toString(),
        medication.appointmentId?.toString(),
        medication.doctorName,
        medication.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [deferredSearchQuery, medications]);

  const columns: Column<PatientMedicationRow>[] = useMemo(
    () => [
      {
        header: "Medication",
        render: (medication) => (
          <div className="space-y-0.5">
            <p className="font-medium">
              {highlightText(medication.medicationName, deferredSearchQuery)}
            </p>
            <p className="text-xs text-muted-foreground">
              {highlightText(medication.genericName || "-", deferredSearchQuery)}
            </p>
          </div>
        ),
        className: "min-w-[240px] px-5 py-4",
      },
      {
        header: "Dosage",
        render: (medication) =>
          highlightText(medication.dosage || "-", deferredSearchQuery),
        className: "w-[150px] px-5 py-4",
      },
      {
        header: "Quantity",
        render: (medication) => medication.quantity,
        className: "w-[120px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Prescription",
        render: (medication) =>
          highlightText(`#${medication.prescriptionId}`, deferredSearchQuery),
        className: "w-[150px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Doctor",
        render: (medication) =>
          highlightText(medication.doctorName || "-", deferredSearchQuery),
        className: "min-w-[180px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Status",
        render: (medication) => (
          <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs">
            {medication.status}
          </Badge>
        ),
        className: "w-[130px] px-5 py-4",
      },
      {
        header: "Actions",
        render: (medication) => (
          <div className="flex items-center justify-center">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => setSelectedMedication(medication)}
              aria-label="View medication"
              title="View"
            >
              <Eye className="size-4" />
            </Button>
          </div>
        ),
        className: "w-[110px] px-5 py-4 text-center",
      },
    ],
    [deferredSearchQuery],
  );

  return (
    <div className="col-start-1 col-end-14 space-y-6">
      <PageHeader
        title="My Medications"
        description="Review medications issued through your prescriptions."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={loadMedications}
            disabled={loading}
            aria-label="Refresh medications"
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        }
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by medication, dosage, prescription, doctor, or status"
        resultCount={filteredMedications.length}
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Loading medications...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredMedications}
            pageable
            pageSize={10}
            showActions={false}
            minWidth="1120px"
            emptyMessage="No medications found."
          />
        )}
      </div>

      <Dialog
        open={Boolean(selectedMedication)}
        onOpenChange={() => setSelectedMedication(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[680px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Pill className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Medication Details
                  </DialogTitle>
                  <DialogDescription>
                    Review dosage and prescription instructions.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedMedication && (
            <div className="space-y-4 px-6 pb-6">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <h3 className="text-lg font-semibold">
                  {selectedMedication.medicationName}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedMedication.genericName || "Generic name not added"}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <InfoPanel label="Dosage" value={selectedMedication.dosage} />
                <InfoPanel
                  label="Quantity"
                  value={String(selectedMedication.quantity)}
                />
                <InfoPanel
                  label="Prescription"
                  value={`#${selectedMedication.prescriptionId}`}
                />
                <InfoPanel
                  label="Appointment"
                  value={`#${selectedMedication.appointmentId}`}
                />
                <InfoPanel
                  label="Doctor"
                  value={selectedMedication.doctorName}
                />
                <InfoPanel
                  label="Date"
                  value={
                    selectedMedication.prescriptionDate ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3" />
                        {new Date(
                          selectedMedication.prescriptionDate,
                        ).toLocaleDateString()}
                      </span>
                    ) : (
                      "-"
                    )
                  }
                />
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Instructions</p>
                <p className="text-sm">
                  {selectedMedication.specialInstructions ||
                    "No special instructions added."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoPanel({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
