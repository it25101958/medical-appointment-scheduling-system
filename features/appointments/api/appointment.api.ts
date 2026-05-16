// src/features/appointments/api/appointment.api.ts
import { apiRequest } from "@/lib/api-client";
import {
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AppointmentStatusUpdateRequest,
  AppointmentResponse,
} from "../types/appointment.types";

const BASE_URL = "/appointment"; // will append to INTERNAL_BACKEND_URL in api-client

export const appointmentApi = {
  getAll: async () => {
    const data = await apiRequest<AppointmentResponse[]>(BASE_URL);
    return data;
  },

  getById: async (appointmentId: number) => {
    const data = await apiRequest<AppointmentResponse>(
      `${BASE_URL}/${appointmentId}`,
    );
    return data;
  },

  create: async (data: AppointmentCreateRequest) => {
    const res = await apiRequest(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res;
  },

  update: async (appointmentId: number, data: AppointmentUpdateRequest) => {
    const res = await apiRequest(`${BASE_URL}/${appointmentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res;
  },

  updateStatus: async (
    appointmentId: number,
    data: AppointmentStatusUpdateRequest,
  ) => {
    const res = await apiRequest(`${BASE_URL}/${appointmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res;
  },

  cancel: async (appointmentId: number) => {
    const res = await apiRequest(`${BASE_URL}/${appointmentId}`, {
      method: "DELETE",
    });
    return res;
  },
};
