// Appointments Feature - Barrel Exports

// Types & Schemas
export type { Appointment, AppointmentStatus } from "./types/appointment.types";
export type {
  RoomScheduleRequest,
  RoomScheduleResponse,
} from "./types/appointment.types";

// API
export { appointmentApi } from "./api/appointment.api";

// Hooks
export { useAppointment } from "./hooks/use-appointment";
export { useAppointments } from "./hooks/use-appointments";

// Utils
export {
  formatAppointmentDate,
  formatAppointmentTime,
  formatAppointmentDateTime,
} from "./utils/appointment-formatters";
export {
  canEditAppointment,
  canDeleteAppointment,
} from "./utils/appointment-permissions";

// Components
export { AppointmentTable } from "./components/appointment-table";
export { AppointmentForm } from "./components/appointment-form";
export { AppointmentDetailsDialog } from "./components/appointment-details-dialog";
export { AppointmentStatusBadge } from "./components/appointment-status-badge";
export { AppointmentActions } from "./components/appointment-actions";
export { AppointmentLinkedRecords } from "./components/appointment-linked-records";
