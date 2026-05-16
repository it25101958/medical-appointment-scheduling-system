"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Calendar, User, Clipboard, Pill, FileText } from "lucide-react";
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
    switch (status) {
      case "Pending":
        return {
          color:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          label: "Pending",
        };
      case "Completed":
        return {
          color:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          label: "Completed",
        };
      case "Cancelled":
        return {
          color: "bg-destructive/10 text-destructive border-destructive/20",
          label: "Cancelled",
        };
      default:
        return {
          color: "bg-muted text-muted-foreground border-transparent",
          label: status,
        };
    }
  };

  const status = getStatusDetails(prescription.status);

  return (
    <Dialog open={!!prescription} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="boxwidth">
        {/* Sticky Header with the singular Close action button */}
        <DialogHeader className="p-5 flex flex-row items-center justify-between space-y-0 bg-card">
          <div className="space-y-1">
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Clipboard className="h-4 w-4 text-primary" />
              Prescription Details
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Reference ID:{" "}
              <span className="font-mono text-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded">
                {prescription.appointmentId}
              </span>
            </p>
          </div>
        </DialogHeader>

        {/* Scrollable Layout Body */}
        <ScrollArea className="flex-1 bg-background">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Sidebar Overview Card */}
            <div className="space-y-4 lg:col-span-1">
              <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Overview
                </h4>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-background border border-border mt-0.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Patient
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {prescription.patientName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-background border border-border mt-0.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Prescribing Doctor
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {prescription.doctorName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-background border border-border mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Issued Date
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {new Date(
                          prescription.prescriptionDate,
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Status
                  </span>
                  <Badge
                    variant="outline"
                    className={`font-semibold px-2.5 py-0.5 text-xs rounded-md ${status.color}`}
                  >
                    {status.label}
                  </Badge>
                </div>
              </div>

              {/* Notes panel */}
              {prescription.notes && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Clinical Notes</span>
                  </div>
                  <p className="text-sm text-muted-foreground bg-background/60 p-3 rounded-lg border border-border/40 leading-relaxed">
                    {prescription.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Main Medications Table Layout Panel */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2 px-0.5">
                <Pill className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
                  Prescribed Medications ({prescription.items.length})
                </h3>
              </div>

              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-foreground h-10 w-[35%]">
                        Medication
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-foreground h-10 w-[20%]">
                        Dosage
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-foreground h-10 w-[15%] text-center">
                        Quantity
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-foreground h-10 w-[30%]">
                        Instructions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescription.items.map(
                      (item: PrescriptionItemResponse) => (
                        <TableRow
                          key={item.prescriptionItemId}
                          className="hover:bg-muted/20 border-b border-border last:border-b-0 transition-colors"
                        >
                          <TableCell className="align-top py-3.5">
                            <div className="text-sm font-semibold text-foreground">
                              {item.medicationName}
                            </div>
                            {item.genericName && (
                              <span className="text-xs text-muted-foreground/80 block mt-0.5 font-mono">
                                {item.genericName}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="align-top py-3.5 text-sm text-muted-foreground font-medium">
                            {item.dosage}
                          </TableCell>
                          <TableCell className="align-top py-3.5 text-sm text-center font-mono font-semibold text-foreground">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="align-top py-3.5 text-sm text-muted-foreground leading-relaxed">
                            {item.specialInstructions || (
                              <span className="text-muted-foreground/30">
                                —
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
