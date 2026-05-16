// src/features/appointments/schemas/appointment.schema.ts

import * as z from "zod";

export const appointmentCreateSchema = z.object({
  patientId: z.coerce.number().min(1, "Patient is required"),
  doctorId: z.coerce.number().min(1, "Doctor is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  appointmentType: z.string().min(1, "Appointment type is required"),
  notes: z.string().max(255, "Notes cannot exceed 255 characters").optional(),
});

export const appointmentUpdateSchema = z.object({
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
  durationMinutes: z.coerce.number().min(1).optional(),
  appointmentType: z.string().optional(),
  notes: z.string().max(255).optional(),
});
