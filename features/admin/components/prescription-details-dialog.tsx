"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { X } from "lucide-react";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={!!prescription} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-[95vw] max-w-[1200px] h-[85vh] rounded-xl overflow-hidden bg-card dark:bg-card p-6">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl">Prescription Details</DialogTitle>
          <Button variant="ghost" onClick={onClose}>
            <X />
          </Button>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-80px)] mt-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="text-lg">{prescription.patientName}</p>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Doctor</p>
              <p className="text-lg">{prescription.doctorName}</p>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Appointment Ref</p>
              <p className="text-lg">{prescription.appointmentId}</p>
            </div>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">Prescription Date</p>
              <p className="text-lg">
                {new Date(prescription.prescriptionDate).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-md col-span-2 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor(prescription.status)}>
                {prescription.status}
              </Badge>
            </div>
            {prescription.notes && (
              <div className="p-4 bg-muted rounded-md col-span-2">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p>{prescription.notes}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg mb-2">Prescription Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Generic Name</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Instructions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescription.items.map((item: PrescriptionItemResponse) => (
                  <TableRow key={item.prescriptionItemId}>
                    <TableCell>{item.medicationName}</TableCell>
                    <TableCell>{item.genericName}</TableCell>
                    <TableCell>{item.dosage}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.specialInstructions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
