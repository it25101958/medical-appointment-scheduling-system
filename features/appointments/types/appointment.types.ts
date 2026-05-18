// src/features/appointments/types/appointment.types.ts

export type AppointmentStatus =
  | "PENDING"
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED";

export type AppointmentType =
  | "CONSULTATION"
  | "FOLLOW_UP"
  | "EMERGENCY"
  | "ROUTINE_CHECKUP";

export interface AppointmentResponse {
  appointmentId: number;
  appointmentNumber: number;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  appointmentType: AppointmentType;
  notes?: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  patient: string;
  doctor: string;
  room: string;
}

export interface AppointmentCreateRequest {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: AppointmentType;
  notes?: string;
}

export interface AppointmentUpdateRequest {
  appointmentDate?: string;
  appointmentTime?: string;
  durationMinutes?: number;
  appointmentType?: AppointmentType;
  notes?: string;
}

export interface AppointmentStatusUpdateRequest {
  status: AppointmentStatus;
}
