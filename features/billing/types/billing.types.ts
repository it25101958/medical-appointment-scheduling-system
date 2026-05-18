export type BillingStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

export interface BillingResponse {
  billingId: number;
  appointmentId?: number;
  finalAmount: number;
  billingDate?: string;
  dueDate?: string;
  status: BillingStatus;
}

export interface BillingPayload {
  appointment?: {
    appointmentId: number;
  };
  patient?: {
    patientId: number;
  };
  totalAmount: number;
  discount?: number;
  tax?: number;
  dueDate?: string;
  status?: BillingStatus;
}
