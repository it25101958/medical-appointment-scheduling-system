import { apiRequest } from "@/lib/api-client";

export interface LabTest {
  id: number;
  testName: string;
  category: string;
  description: string;
  standardPrice: number | string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabTestPayload {
  testName: string;
  category: string;
  description: string;
  standardPrice: number;
  isActive: boolean;
}

export async function getAllLabTests(): Promise<LabTest[]> {
  return await apiRequest("/lab-test", {
    method: "GET",
    cache: "no-store",
  });
}

export async function getActiveLabTests(): Promise<LabTest[]> {
  return await apiRequest("/lab-test/active", {
    method: "GET",
    cache: "no-store",
  });
}

export async function getInactiveLabTests(): Promise<LabTest[]> {
  return await apiRequest("/lab-test/inactive", {
    method: "GET",
    cache: "no-store",
  });
}

export async function getLabTest(labTestId: number): Promise<LabTest> {
  return await apiRequest(`/lab-test/${labTestId}`, {
    method: "GET",
    cache: "no-store",
  });
}

export async function createLabTest(payload: LabTestPayload): Promise<LabTest> {
  return await apiRequest("/lab-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateLabTest(
  labTestId: number,
  payload: LabTestPayload,
): Promise<LabTest> {
  return await apiRequest(`/lab-test/${labTestId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteLabTest(labTestId: number): Promise<void> {
  await apiRequest(`/lab-test/${labTestId}`, {
    method: "DELETE",
  });
}
