"use client";

import {
  CalendarDays,
  Clipboard,
  FileText,
  Hash,
  Pill,
  Stethoscope,
  User,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  PrescriptionResponse,
  PrescriptionItemResponse,
} from "@/types/prescription-types";

interface Props {
  prescription: PrescriptionResponse | null;
  onClose: () => void;
}

export function PrescriptionDetailsDialog({ prescription, onClose }: Props) {
  if (!prescription) return null;

  const getStatusDetails = (status: string) => {
    const normalized = status.trim().toUpperCase();

    switch (normalized) {
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          label: "PENDING",
        };
      case "ACTIVE":
      case "CONFIRMED":
        return {
          color: "bg-blue-100 text-blue-700 border-blue-200",
          label: normalized,
        };
      case "COMPLETED":
        return {
          color: "bg-green-100 text-green-700 border-green-200",
          label: "COMPLETED",
        };
      case "CANCELLED":
        return {
          color: "bg-red-100 text-red-700 border-red-200",
          label: "CANCELLED",
        };
      default:
        return {
          color: "bg-muted text-muted-foreground border-border",
          label: status,
        };
    }
  };

  const status = getStatusDetails(prescription.status);

  return (
    <Dialog open={!!prescription} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[900px]">
        <DialogHeader>
          <div className="border-b border-border/60 px-6 pb-5 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Pill className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Prescription Details
                </DialogTitle>
                <DialogDescription>
                  Review prescription details and medication instructions.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Prescription Reference
              </p>
              <p className="text-lg">#{prescription.prescriptionId}</p>
            </div>

            <Badge
              variant="outline"
              className={`rounded-full px-3 py-1 text-xs font-normal ${status.color}`}
            >
              {status.label}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={<Hash className="h-4 w-4" />}
              label="Appointment"
              value={`#${prescription.appointmentId}`}
            />

            <InfoItem
              icon={<CalendarDays className="h-4 w-4" />}
              label="Date"
              value={new Date(prescription.prescriptionDate).toLocaleDateString(
                undefined,
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
            />

            <InfoItem
              icon={<Clipboard className="h-4 w-4" />}
              label="Items"
              value={`${prescription.items.length} medication${
                prescription.items.length === 1 ? "" : "s"
              }`}
            />

            <InfoItem
              icon={<User className="h-4 w-4" />}
              label="Patient"
              value={prescription.patientName}
            />

            <InfoItem
              icon={<Stethoscope className="h-4 w-4" />}
              label="Doctor"
              value={prescription.doctorName}
            />

            <InfoItem
              icon={<Pill className="h-4 w-4" />}
              label="Prescription ID"
              value={`#${prescription.prescriptionId}`}
            />
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Notes
            </div>
            <p className="text-sm">
              {prescription.notes?.trim() ||
                "No notes added for this prescription."}
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Pill className="h-4 w-4" />
              Medications
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Instructions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescription.items.map((item: PrescriptionItemResponse) => (
                  <TableRow key={item.prescriptionItemId}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm">{item.medicationName}</p>
                        {item.genericName ? (
                          <p className="text-xs text-muted-foreground">
                            {item.genericName}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{item.dosage}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {item.specialInstructions || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm">{value}</p>
    </div>
  );
}
