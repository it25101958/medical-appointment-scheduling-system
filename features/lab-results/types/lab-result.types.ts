export type LabResultStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface LabResultRequest {
  appointmentId: number;
  patientId: number;
  labTestId?: number;
  testName: string;
  resultValue: string;
  referenceRange: string;
  status: LabResultStatus | string;
  remarks?: string;
  testDate?: string;
}

export interface LabResultResponse {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName?: string | null;
  testName: string;
  resultValue: string;
  referenceRange: string;
  status: LabResultStatus | string;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
}
