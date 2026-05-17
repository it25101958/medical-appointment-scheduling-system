export interface LabOrderItemRequest {
  labTestId: number;
  quantity: number;
}

export interface LabOrderRequest {
  appointmentId: number;
  laboratoryId: number;
  items: LabOrderItemRequest[];
}

export interface LabOrderItemResponse {
  labOrderItemId: number;
  labTestId: number;
  testName: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  status: string;
  createdAt: string;
}

export interface LabOrderResponse {
  labOrderId: number;
  appointmentId: number;
  laboratoryName: string;
  patientName: string;
  doctorName: string;
  items: LabOrderItemResponse[];
}

export interface LabOrderSearchParams {
  patientId?: number;
  status?: string;
  date?: string;
}
