import { apiRequest } from "@/lib/api-client";

export interface Room {
  roomId: number;
  roomType?: string;
  capacity?: number;
  equipmentAvailable?: string;
  status?: string;
  [key: string]: unknown;
}

export interface RoomPayload {
  roomNumber: string;
  roomType: string;
  capacity: number;
  equipmentAvailable: string;
  status: string;
}

export async function getRooms(): Promise<Room[]> {
  return await apiRequest("/room", {
    method: "GET",
    cache: "no-store",
  });
}

export async function createRoom(payload: RoomPayload): Promise<Room> {
  return await apiRequest("/room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateRoom(
  roomId: number,
  payload: Partial<RoomPayload>,
): Promise<Room> {
  return await apiRequest(`/room/${roomId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteRoom(roomId: number): Promise<void> {
  await apiRequest(`/room/${roomId}`, {
    method: "DELETE",
  });
}
