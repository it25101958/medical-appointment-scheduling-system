// src/features/appointments/components/appointment-details-dialog.tsx

"use client";

import {
  CalendarDays,
  Clock,
  DoorOpen,
  FileText,
  Hash,
  Stethoscope,
  User,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AppointmentResponse } from "../types/appointment.types";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { AppointmentLinkedRecords } from "./appointment-linked-records";

interface Props {
  appointment: AppointmentResponse | null;
  onClose: () => void;
}

export function AppointmentDetailsDialog({ appointment, onClose }: Props) {
  if (!appointment) return null;

  return (
    <Dialog open={!!appointment} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[1100px] rounded-2xl p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-xl font-normal">
            Appointment Details
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/50 p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Appointment Reference
              </p>
              <p className="text-lg">#{appointment.appointmentId}</p>
            </div>

            <AppointmentStatusBadge status={appointment.status} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={<Hash className="h-4 w-4" />}
              label="Queue Number"
              value={`#${appointment.appointmentNumber}`}
            />

            <InfoItem
              icon={<CalendarDays className="h-4 w-4" />}
              label="Date"
              value={appointment.appointmentDate}
            />

            <InfoItem
              icon={<Clock className="h-4 w-4" />}
              label="Time"
              value={`${appointment.appointmentTime} (${appointment.durationMinutes} mins)`}
            />

            <InfoItem
              icon={<User className="h-4 w-4" />}
              label="Patient"
              value={`Patient #${appointment.patientId}`}
            />

            <InfoItem
              icon={<Stethoscope className="h-4 w-4" />}
              label="Doctor"
              value={`Doctor #${appointment.doctorId}`}
            />

            <InfoItem
              icon={<DoorOpen className="h-4 w-4" />}
              label="Room"
              value={`Room #${appointment.roomId}`}
            />
          </div>

          <div className="mt-5 rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Notes
            </div>
            <p className="text-sm">
              {appointment.notes || "No notes added for this appointment."}
            </p>
          </div>

          <AppointmentLinkedRecords appointmentId={appointment.appointmentId} />
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
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm">{value}</p>
    </div>
  );
}
