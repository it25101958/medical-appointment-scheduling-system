import { apiRequest } from "@/lib/api-client";

import type { PaymentPayload, PaymentResponse } from "../types/payment.types";

const BASE_URL = "/payment";

export const paymentApi = {
  getAll: async () => {
    return apiRequest<PaymentResponse[]>(BASE_URL, {
      method: "GET",
      cache: "no-store",
    });
  },

  getById: async (paymentId: number) => {
    return apiRequest<PaymentResponse>(`${BASE_URL}/${paymentId}`, {
      method: "GET",
      cache: "no-store",
    });
  },

  getByPatient: async (patientId: number) => {
    return apiRequest<PaymentResponse[]>(`${BASE_URL}/patient/${patientId}`, {
      method: "GET",
      cache: "no-store",
    });
  },

  getByAppointment: async (appointmentId: number) => {
    return apiRequest<PaymentResponse[]>(
      `${BASE_URL}/appointment/${appointmentId}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
  },

  getByStatus: async (paymentStatus: number) => {
    return apiRequest<PaymentResponse[]>(`${BASE_URL}/status/${paymentStatus}`, {
      method: "GET",
      cache: "no-store",
    });
  },

  getByTransactionId: async (transactionId: string) => {
    return apiRequest<PaymentResponse>(
      `${BASE_URL}/transaction/${encodeURIComponent(transactionId)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
  },

  create: async (payload: PaymentPayload) => {
    return apiRequest<PaymentResponse>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: async (paymentId: number, payload: PaymentPayload) => {
    return apiRequest<PaymentResponse>(`${BASE_URL}/${paymentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  delete: async (paymentId: number) => {
    return apiRequest<void>(`${BASE_URL}/${paymentId}`, {
      method: "DELETE",
    });
  },
};
