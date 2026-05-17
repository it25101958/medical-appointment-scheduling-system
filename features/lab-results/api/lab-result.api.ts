import { apiRequest } from "@/lib/api-client";
import {
  LabResultRequest,
  LabResultResponse,
} from "../types/lab-result.types";

const BASE_URL = "/lab-results";

export const labResultApi = {
  create: async (data: LabResultRequest) => {
    return apiRequest<LabResultResponse>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getById: async (id: number) => {
    return apiRequest<LabResultResponse>(`${BASE_URL}/${id}`, {
      cache: "no-store",
    });
  },

  getByPatient: async (patientId: number) => {
    return apiRequest<LabResultResponse[]>(`${BASE_URL}/patient/${patientId}`, {
      cache: "no-store",
    });
  },

  update: async (id: number, data: LabResultRequest) => {
    return apiRequest<LabResultResponse>(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
