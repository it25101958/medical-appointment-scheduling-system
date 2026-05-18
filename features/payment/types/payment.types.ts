export interface PaymentResponse {
  paymentId: number;
  patientId: number;
  appointmentId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: number;
  transactionId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentPayload {
  patientId: number;
  appointmentId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: number;
  transactionId: string;
}
