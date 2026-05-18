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
  patientId: number;
  doctorId: number;
  roomId: number;
  patient: AppointmentPatientSummary;
  doctor: AppointmentDoctorSummary;
  room: AppointmentRoomSummary;
  feedbacks?: unknown[];
}

export interface AppointmentPatientSummary {
  patientId: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  FullName?: string;
  email: string;
  phone: string;
  bloodGroup?: string | null;
  allergies?: string | null;
}

export interface AppointmentDoctorSummary {
  doctorId: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
}

export interface AppointmentRoomSummary {
  roomId: number;
  roomNumber: string;
  roomType: string;
  capacity: number;
  status: string;
  equipmentAvailable?: string | null;
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
