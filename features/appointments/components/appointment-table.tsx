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
      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Appointment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
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
                <TableRow key={appointment.appointmentId}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">
                        #{appointment.appointmentNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.appointmentType}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>{appointment.appointmentDate}</TableCell>
                  <TableCell>{appointment.appointmentTime}</TableCell>
                  <TableCell>Patient #{appointment.patientId}</TableCell>
                  <TableCell>Doctor #{appointment.doctorId}</TableCell>
                  <TableCell>Room #{appointment.roomId}</TableCell>

                  <TableCell>
                    <AppointmentStatusBadge status={appointment.status} />
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
