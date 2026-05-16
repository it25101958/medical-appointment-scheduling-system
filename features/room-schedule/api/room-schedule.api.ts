import { apiRequest } from "@/lib/api-client";
import {
  RoomScheduleRequest,
  RoomScheduleResponse,
} from "../types/room-schedule.types";

const BASE_URL = "/room-schedule";

export const roomScheduleApi = {
  create: async (data: RoomScheduleRequest): Promise<RoomScheduleResponse> => {
    return await apiRequest(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    scheduleId: number,
    data: Partial<RoomScheduleRequest>,
  ): Promise<RoomScheduleResponse> => {
    return await apiRequest(`${BASE_URL}/${scheduleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (scheduleId: number): Promise<void> => {
    await apiRequest(`${BASE_URL}/${scheduleId}`, {
      method: "DELETE",
    });
  },

  getDoctorScheduleToday: async (
    doctorId: number,
  ): Promise<RoomScheduleResponse[]> => {
    return await apiRequest(`${BASE_URL}/doctor/${doctorId}/today`);
  },

  getByAppointmentId: async (
    appointmentId: number,
  ): Promise<RoomScheduleResponse> => {
    return await apiRequest(`${BASE_URL}/appointment/${appointmentId}`);
  },

  getAllDoctorSchedules: async (
    doctorId: number,
  ): Promise<RoomScheduleResponse[]> => {
    return await apiRequest(`${BASE_URL}/doctor/${doctorId}`);
  },
};
