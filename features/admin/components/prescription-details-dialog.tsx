"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrescriptionItem {
  prescriptionItemId: number;
  medicationName: string;
  genericName?: string;
  dosage: string;
  quantity: number;
  specialInstructions?: string;
}

interface PrescriptionDetails {
  prescriptionDate?: string;
  status: string;
  patientName: string;
  doctorName: string;
  appointmentId: number;
  createdAt: string;
  notes?: string;
  items?: PrescriptionItem[];
}

export function PrescriptionDetailsDialog({
  prescription,
  onClose,
}: {
  prescription: PrescriptionDetails | null;
  onClose: () => void;
}) {
  if (!prescription) return null;

  return (
    <Dialog open={!!prescription} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-[1200px] h-[85vh] flex flex-col rounded-xl shadow-lg overflow-hidden bg-card dark:bg-card"
        style={{ width: "95vw", maxWidth: "1200px" }}
      >
        {/* Header */}
        <DialogHeader className="flex justify-between items-start px-8 py-6 border-b border-border bg-card dark:bg-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="size-6 text-primary" />
              <DialogTitle className="text-2xl font-medium text-foreground dark:text-foreground tracking-tight">
                Prescription Analysis
              </DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Issued:{" "}
              <span className="text-foreground dark:text-foreground">
                {new Date(
                  prescription.prescriptionDate ?? prescription.createdAt,
                ).toDateString()}
              </span>
            </p>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "py-1 rounded-md text-xs tracking-wide",
              prescription.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
                : "bg-orange-50 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
            )}
          >
            {prescription.status}
          </Badge>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 flex flex-col p-6 bg-background/20 dark:bg-background/20 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-4">
            <MetadataCell label="Patient" value={prescription.patientName} />
            <MetadataCell label="Doctor" value={prescription.doctorName} />
            <MetadataCell
              label="Appointment Ref"
              value={prescription.appointmentId}
            />
            <MetadataCell
              label="Created On"
              value={new Date(prescription.createdAt).toLocaleDateString()}
            />
          </div>

          {/* Clinical Remarks */}
          <div className="pb-4">
            <h4 className="text-xs font-medium uppercase text-primary flex items-center gap-2 mb-2">
              <FileText className="size-3" /> Clinical Remarks
            </h4>
            <div className="bg-card border border-border rounded-md p-4 text-sm text-foreground font-light">
              {prescription.notes ||
                "No additional clinical observations provided."}
            </div>
          </div>

          {/* Medication Table */}
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] w-full bg-card border border-border rounded-md">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-card dark:bg-card">
                <TableRow>
                  <TableHead className="tableHead">Medical Item</TableHead>
                  <TableHead className="tableHead">Dosage</TableHead>
                  <TableHead className="tableHead text-center">
                    Quantity
                  </TableHead>
                  <TableHead className="tableHead text-right">
                    Administration
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescription.items?.map((item) => (
                  <TableRow
                    key={item.prescriptionItemId}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <TableCell className="py-4 text-foreground dark:text-foreground">
                      <div className="text-base text-foreground dark:text-foreground">
                        {item.medicationName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.genericName}
                      </div>
                    </TableCell>
                    <TableCell className="text-base text-foreground dark:text-foreground">
                      {item.dosage}
                    </TableCell>
                    <TableCell className="text-center text-primary dark:text-primary">
                      {item.quantity} Units
                    </TableCell>
                    <TableCell className="text-right text-sm text-primary/80 dark:text-primary/80 ">
                      {item.specialInstructions || "No special instructions"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetadataCell({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-card/70 dark:bg-card/70 p-4 flex flex-col gap-1 rounded-md border border-border">
      <span className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
        {label}
      </span>
      <p className="text-sm font-light text-foreground dark:text-foreground">
        {value}
      </p>
    </div>
  );
}
