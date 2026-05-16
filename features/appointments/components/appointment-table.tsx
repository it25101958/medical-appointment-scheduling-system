// src/features/appointments/components/appointment-table.tsx

"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AppointmentResponse } from "../types/appointment.types";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { AppointmentDetailsDialog } from "./appointment-details-dialog";
import { AppointmentActions } from "./appointment-actions";

interface Props {
  appointments: AppointmentResponse[];
  canManage?: boolean;
  onChanged?: () => void;
}

export function AppointmentTable({
  appointments,
  canManage = false,
  onChanged,
}: Props) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentResponse | null>(null);

  return (
    <>
      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">
                Appointment
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">
                Time
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">
                Patient
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">
                Doctor
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">
                Room
              </TableHead>
              <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="px-4 py-2 text-center text-xs font-medium tracking-wide text-muted-foreground">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-28 text-center text-muted-foreground"
                >
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow
                  key={appointment.appointmentId}
                  className="hover:bg-muted/20"
                >
                  <TableCell className="px-4 py-2">
                    <div className="space-y-1">
                      <p className="text-sm">{appointment.appointmentNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.appointmentType}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    {appointment.appointmentDate}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    {appointment.appointmentTime}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    Patient {appointment.patientId}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    Doctor {appointment.doctorId}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    Room {appointment.roomId}
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <AppointmentStatusBadge status={appointment.status} />
                  </TableCell>

                  <TableCell className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {canManage && (
                        <AppointmentActions
                          appointment={appointment}
                          onChanged={onChanged}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </>
  );
}
