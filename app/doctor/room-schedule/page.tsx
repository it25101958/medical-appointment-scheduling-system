"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {
  roomScheduleApi,
  type RoomScheduleResponse,
} from "@/features/room-schedule";
import { apiRequest } from "@/lib/api-client";

interface DoctorInfo {
  doctorId: number;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export default function DoctorRoomSchedulePage() {
  const [schedules, setSchedules] = useState<RoomScheduleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);

  useEffect(() => {
    fetchDoctorInfo();
  }, []);

  useEffect(() => {
    if (doctorInfo?.doctorId) {
      fetchSchedules();
    }
  }, [doctorInfo]);

  async function fetchDoctorInfo() {
    try {
      // Fetch current doctor's info
      const doctor = await apiRequest<DoctorInfo>("/doctors/me", {
        method: "GET",
        cache: "no-store",
      });
      setDoctorInfo(doctor);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function fetchSchedules() {
    if (!doctorInfo?.doctorId) return;
    setIsLoading(true);
    try {
      const data = await roomScheduleApi.getAllDoctorSchedules(
        doctorInfo.doctorId,
      );
      setSchedules(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="col-start-1 col-end-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">My Room Schedules</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            View all your assigned room schedules across the week.
          </p>
        </div>
        <Button onClick={fetchSchedules} size="sm" variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <ScrollArea className="bg-card rounded-lg border-b border-border overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Schedule ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Room
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Day
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Time Slot
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    Loading your schedules...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No schedules assigned yet.
                  </td>
                </tr>
              ) : (
                schedules.map((schedule) => (
                  <tr
                    key={schedule.roomScheduleId}
                    className="border-t border-border hover:bg-muted/20"
                  >
                    <td className="px-4 py-4 font-medium text-muted-foreground">
                      {schedule.roomScheduleId}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      Room {schedule.roomNumber}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {schedule.dayOfWeek}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(schedule.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>
    </div>
  );
}
