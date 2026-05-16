"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, RefreshCcw, Edit3, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  roomScheduleApi,
  type RoomScheduleResponse,
  type RoomScheduleRequest,
  type DayOfWeek,
} from "@/features/room-schedule";
import { Room, getRooms } from "@/lib/services/room-service";
import { apiRequest } from "@/lib/api-client";

interface DoctorOption {
  id: number;
  name: string;
  roleType: number;
}

interface FormValues extends RoomScheduleRequest {
  selectedDate: string; // YYYY-MM-DD format
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function getDayOfWeek(dateString: string): DayOfWeek {
  const date = new Date(dateString + "T00:00:00");
  const days: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[date.getDay()];
}

function formatDateForDisplay(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AdminRoomSchedulePage() {
  const [schedules, setSchedules] = useState<RoomScheduleResponse[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<RoomScheduleResponse | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    roomId: 0,
    doctorId: 0,
    dayOfWeek: "MONDAY",
    startTime: "",
    endTime: "",
    selectedDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [schedulesData, roomsData, doctorsData] = await Promise.all([
        apiRequest<RoomScheduleResponse[]>("/room-schedule", {
          method: "GET",
          cache: "no-store",
        }).catch(() => []),
        getRooms().catch(() => []),
        apiRequest<DoctorOption[]>("/users/role/3", {
          method: "GET",
          cache: "no-store",
        }).catch(() => []),
      ]);
      setSchedules(schedulesData || []);
      setRooms(roomsData || []);
      setDoctors(doctorsData || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateDialog() {
    setSelectedSchedule(null);
    const today = new Date().toISOString().split("T")[0];
    setFormValues({
      roomId: 0,
      doctorId: 0,
      dayOfWeek: getDayOfWeek(today),
      startTime: "",
      endTime: "",
      selectedDate: today,
    });
    setDialogOpen(true);
  }

  function openEditDialog(schedule: RoomScheduleResponse) {
    setSelectedSchedule(schedule);
    setFormValues({
      roomId: 0,
      doctorId: 0,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      selectedDate: new Date().toISOString().split("T")[0],
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(schedule: RoomScheduleResponse) {
    setSelectedSchedule(schedule);
    setDeleteOpen(true);
  }

  async function handleSave() {
    if (formValues.roomId <= 0) {
      toast.error("Please select a room.");
      return;
    }
    if (formValues.doctorId <= 0) {
      toast.error("Please select a doctor.");
      return;
    }
    if (!formValues.selectedDate) {
      toast.error("Please select a date.");
      return;
    }
    if (!formValues.startTime.trim()) {
      toast.error("Start time is required.");
      return;
    }
    if (!formValues.endTime.trim()) {
      toast.error("End time is required.");
      return;
    }

    setIsSaving(true);
    try {
      const dayOfWeek = getDayOfWeek(formValues.selectedDate);
      const payload: RoomScheduleRequest = {
        roomId: formValues.roomId,
        doctorId: formValues.doctorId,
        dayOfWeek,
        startTime: formValues.startTime,
        endTime: formValues.endTime,
      };

      if (selectedSchedule) {
        await roomScheduleApi.update(selectedSchedule.roomScheduleId, payload);
        toast.success("Room schedule updated successfully.");
      } else {
        await roomScheduleApi.create(payload);
        toast.success("Room schedule created successfully.");
      }
      setDialogOpen(false);
      await fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedSchedule) return;
    setIsDeleting(true);
    try {
      await roomScheduleApi.delete(selectedSchedule.roomScheduleId);
      toast.success("Schedule removed successfully.");
      setDeleteOpen(false);
      await fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="col-start-1 col-end-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Manage Room Schedules</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Assign doctors to rooms for specific time slots across the week.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={fetchData} size="sm" variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Schedule
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <ScrollArea className="bg-card rounded-lg border-b border-border overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Schedule ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Room
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Doctor
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Day
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Time Slot
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    Loading schedules...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No schedules found.
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
                    <td className="px-4 py-4 text-sm">{schedule.doctorName}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {schedule.dayOfWeek}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(schedule)}
                        >
                          <Edit3 className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteDialog(schedule)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedSchedule ? "Edit Room Schedule" : "Create Room Schedule"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="room-select">Room *</Label>
              <Select
                value={String(formValues.roomId)}
                onValueChange={(value) =>
                  setFormValues((current) => ({
                    ...current,
                    roomId: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.roomId} value={String(room.roomId)}>
                      Room {room.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="doctor-select">Doctor *</Label>
              <Select
                value={String(formValues.doctorId)}
                onValueChange={(value) =>
                  setFormValues((current) => ({
                    ...current,
                    doctorId: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={String(doctor.id)}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDateForDisplay(formValues.selectedDate) ||
                      "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <Input
                      type="date"
                      value={formValues.selectedDate}
                      onChange={(e) => {
                        setFormValues((current) => ({
                          ...current,
                          selectedDate: e.target.value,
                          dayOfWeek: getDayOfWeek(e.target.value),
                        }));
                      }}
                      className="w-full"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formValues.startTime}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      startTime: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time *</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={formValues.endTime}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      endTime: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {selectedSchedule ? "Save Changes" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Delete Schedule
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Are you sure you want to remove this room schedule?
            <div className="mt-3 rounded-lg border border-border bg-muted p-4 text-sm">
              <p className="font-medium">
                Room {selectedSchedule?.roomNumber} -{" "}
                {selectedSchedule?.doctorName}
              </p>
              <p className="text-muted-foreground text-xs">
                {selectedSchedule?.dayOfWeek} | {selectedSchedule?.startTime} -{" "}
                {selectedSchedule?.endTime}
              </p>
            </div>
          </div>
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              Delete Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
