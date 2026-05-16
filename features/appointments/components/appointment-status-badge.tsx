// src/features/appointments/components/appointment-status-badge.tsx

import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "../types/appointment.types";

const statusStyles: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-3 py-1 text-xs font-normal ${statusStyles[status]}`}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}
