"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Info } from "lucide-react";
import { PrescriptionDetailsDialog } from "./prescription-details-dialog";

interface Prescription {
  prescriptionId: number;
  appointmentId: number;
  patientName: string;
  doctorName: string;
  status: string;
  createdAt: string;
}

export function PrescriptionList({ data = [] }: { data: Prescription[] }) {
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  return (
    <>
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6 w-[120px]">ID</TableHead>
            <TableHead>Appointment</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Practitioner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Created</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((p) => (
              <TableRow
                key={p.prescriptionId}
                className="hover:bg-muted/10 transition-colors"
              >
                <TableCell className="pl-6 font-medium">
                  {p.prescriptionId}
                </TableCell>
                <TableCell>{p.appointmentId}</TableCell>
                <TableCell>{p.patientName}</TableCell>
                <TableCell>{p.doctorName}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Calendar className="size-3" />
                    {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPrescription(p)}
                  >
                    <Info className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center italic text-muted-foreground h-24"
              >
                No prescriptions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <PrescriptionDetailsDialog
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />
    </>
  );
}
