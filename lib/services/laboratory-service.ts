import { apiRequest } from "@/lib/api-client";

export interface Laboratory {
  laboratoryId: number;
  name: string;
  address: string;
  openingHours: string;
  phone: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LaboratoryPayload {
  name: string;
  address: string;
  openingHours: string;
  phone: string;
  email: string;
}

export async function getLaboratories(): Promise<Laboratory[]> {
  return await apiRequest("/laboratory", {
    method: "GET",
    cache: "no-store",
  });
}

export async function getLaboratory(laboratoryId: number): Promise<Laboratory> {
  return await apiRequest(`/laboratory/${laboratoryId}`, {
    method: "GET",
    cache: "no-store",
  });
}

export async function createLaboratory(
  payload: LaboratoryPayload,
): Promise<Laboratory> {
  return await apiRequest("/laboratory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateLaboratory(
  laboratoryId: number,
  payload: LaboratoryPayload,
): Promise<Laboratory> {
  return await apiRequest(`/laboratory/${laboratoryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteLaboratory(laboratoryId: number): Promise<void> {
  await apiRequest(`/laboratory/${laboratoryId}`, {
    method: "DELETE",
  });
}
