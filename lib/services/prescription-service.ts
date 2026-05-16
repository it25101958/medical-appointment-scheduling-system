import { apiRequest } from "@/lib/api-client";

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface PrescriptionItem {
  prescriptionItemId: number;
  medicationName: string;
  dosage: string;
  quantity: number;
  specialInstructions: string;
}

export interface Prescription {
  prescriptionId: number;
  appointmentId: number;
  doctorName: string;
  patientName: string;
  prescriptionDate: string;
  status: string;
  notes: string;
  items: PrescriptionItem[];
}

export async function getPaginatedPrescriptions(
  page: number = 0,
  size: number = 5,
): Promise<PaginatedResponse<Prescription>> {
  return await apiRequest(`prescription?page=${page}&size=${size}`, {
    method: "GET",
    cache: "no-store",
  });
}
