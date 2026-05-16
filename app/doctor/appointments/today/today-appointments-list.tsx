"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";

import { apiRequest } from "@/lib/api-client";
import { AppointmentResponse } from "@/features/appointments/types/appointment.types";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppointmentDetailsDialog } from "@/features/appointments/components/appointment-details-dialog";

interface Props {
  appointments: AppointmentResponse[];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 text-xs font-normal",
        styles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </Badge>
  );
}

function formatTime(time: string) {
  if (!time) return "Not set";

  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute));

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TodayAppointmentsList({ appointments }: Props) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentResponse | null>(null);
  const [loadingAppointmentId, setLoadingAppointmentId] = useState<
    number | null
  >(null);

  async function loadAppointment(appointmentId: number) {
    setLoadingAppointmentId(appointmentId);
    setSelectedAppointment(null);

    try {
      const appointment = await apiRequest<AppointmentResponse>(
        `/appointment/${appointmentId}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      setSelectedAppointment(appointment);
    } finally {
      setLoadingAppointmentId(null);
    }
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-sm col-start-1 col-end-14">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
          <CalendarClock className="size-7 text-muted-foreground" />
        </div>

        <h2 className="text-lg font-medium">No appointments today</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You do not have any scheduled consultations for today.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <ScrollArea className="bg-card rounded-lg border border-border overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[110px]">
                  Queue
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[130px]">
                  Time
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[130px]">
                  Patient
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[130px]">
                  Room
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[150px]">
                  Type
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[130px]">
                  Status
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[220px]">
                  Notes
                </TableHead>
                <TableHead className="px-4 py-2 text-center text-xs font-medium tracking-wide text-muted-foreground min-w-[170px]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {appointments.map((appointment) => (
                <TableRow
                  key={appointment.appointmentId}
                  className="hover:bg-muted/20"
                >
                  <TableCell className="px-4 py-2">
                    <span className="text-sm">
                      {appointment.appointmentNumber}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span className="text-sm">
                      {formatTime(appointment.appointmentTime)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span className="text-sm">
                      Patient {appointment.patientId}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span className="text-sm">Room {appointment.roomId}</span>
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span className="text-sm">
                      {appointment.appointmentType}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <StatusBadge status={appointment.status} />
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {appointment.notes || "No notes added"}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => loadAppointment(appointment.appointmentId)}
                      disabled={
                        loadingAppointmentId === appointment.appointmentId
                      }
                    >
                      {loadingAppointmentId === appointment.appointmentId
                        ? "Loading..."
                        : "View Appointment"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </>
  );
}
