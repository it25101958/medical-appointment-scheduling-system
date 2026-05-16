// DayOfWeek enum from backend
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface RoomScheduleResponse {
  roomScheduleId: number;
  roomNumber: string;
  doctorName: string;
  slot: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomScheduleRequest {
  roomId: number;
  doctorId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}
