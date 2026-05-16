// src/features/appointments/components/appointment-table.tsx

"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import { Button, DataTable, type Column } from "@/components/ui";

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

  const columns: Column<AppointmentResponse>[] = [
    {
      header: "Appointment",
      render: (appointment) => (
        <div className="space-y-1">
          <p className="text-sm">{appointment.appointmentNumber}</p>
          <p className="text-xs text-muted-foreground">
            {appointment.appointmentType}
          </p>
        </div>
      ),
    },
    { header: "Date", accessor: "appointmentDate" },
    { header: "Time", accessor: "appointmentTime" },
    {
      header: "Patient",
      render: (appointment) => `Patient ${appointment.patientId}`,
    },
    {
      header: "Doctor",
      render: (appointment) => `Doctor ${appointment.doctorId}`,
    },
    { header: "Room", render: (appointment) => `Room ${appointment.roomId}` },
    {
      header: "Status",
      render: (appointment) => (
        <AppointmentStatusBadge status={appointment.status} />
      ),
    },
    {
      header: "Action",
      render: (appointment) => (
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
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={appointments}
        pageable={true}
        pageSize={10}
        showActions={false}
        emptyMessage="No appointments found"
      />

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </>
  );
}
