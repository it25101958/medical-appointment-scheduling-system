import { apiRequest } from "@/lib/api-client";

import type { BillingPayload, BillingResponse } from "../types/billing.types";

const BASE_URL = "/billing";

export const billingApi = {
  getAll: async () => {
    return apiRequest<BillingResponse[]>(BASE_URL, {
      method: "GET",
      cache: "no-store",
    });
  },

  getById: async (billingId: number) => {
    return apiRequest<BillingResponse>(`${BASE_URL}/${billingId}`, {
      method: "GET",
      cache: "no-store",
    });
  },

  getByPatient: async (patientId: number) => {
    return apiRequest<BillingResponse[]>(`${BASE_URL}/patient/${patientId}`, {
      method: "GET",
      cache: "no-store",
    });
  },

  getByAppointment: async (appointmentId: number) => {
    return apiRequest<BillingResponse[]>(
      `${BASE_URL}/appointment/${appointmentId}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
  },

  create: async (payload: BillingPayload) => {
    return apiRequest<BillingResponse>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (billingId: number, payload: BillingPayload) => {
    return apiRequest<BillingResponse>(`${BASE_URL}/${billingId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (billingId: number) => {
    return apiRequest<void>(`${BASE_URL}/${billingId}`, {
      method: "DELETE",
    });
  },
};
