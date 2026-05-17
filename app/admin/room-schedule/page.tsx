"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Label,
  StyledDialog,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  DataTable,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { highlightText } from "@/lib/highlight-search";
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
import { getErrorMessage } from "@/lib/utils";

interface UserOption {
  userId: number;
  firstName: string;
  lastName: string;
}

interface FormValues extends RoomScheduleRequest {
  selectedDate: string; // YYYY-MM-DD format
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

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function AdminRoomSchedulePage() {
  const [schedules, setSchedules] = useState<RoomScheduleResponse[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [doctors, setDoctors] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchedule, setSelectedSchedule] =
    useState<RoomScheduleResponse | null>(null);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredSchedules = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return schedules;
    return schedules.filter((schedule) => {
      const haystack = [
        schedule.roomScheduleId?.toString(),
        schedule.roomNumber?.toString(),
        schedule.doctorName,
        schedule.dayOfWeek,
        schedule.startTime,
        schedule.endTime,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [deferredSearchQuery, schedules]);

  const columns = useMemo(
    () => [
      {
        header: "Schedule ID",
        render: (schedule: RoomScheduleResponse) =>
          highlightText(
            schedule.roomScheduleId?.toString() || "",
            deferredSearchQuery,
          ),
      },
      {
        header: "Room",
        render: (schedule: RoomScheduleResponse) =>
          highlightText(`Room ${schedule.roomNumber}`, deferredSearchQuery),
      },
      {
        header: "Doctor",
        render: (schedule: RoomScheduleResponse) =>
          highlightText(schedule.doctorName || "", deferredSearchQuery),
      },
      {
        header: "Day",
        render: (schedule: RoomScheduleResponse) =>
          highlightText(schedule.dayOfWeek || "", deferredSearchQuery),
      },
      {
        header: "Time Slot",
        render: (schedule: RoomScheduleResponse) =>
          highlightText(
            `${schedule.startTime} - ${schedule.endTime}`,
            deferredSearchQuery,
          ),
      },
      {
        header: "Actions",
        render: (schedule: RoomScheduleResponse) => (
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
        ),
      },
    ],
    [deferredSearchQuery, openEditDialog, openDeleteDialog],
  );

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

  function normalizeDoctorName(name: string): string {
    return name
      .replace(/^dr\.?\s*/i, "")
      .trim()
      .toLowerCase();
  }

  function getDoctorDisplayName(doctor: UserOption): string {
    return `Dr. ${doctor.lastName}`;
  }

  async function getAllSchedulesForDoctors(doctorsList: UserOption[]) {
    const settled = await Promise.allSettled(
      doctorsList.map((doctor) =>
        roomScheduleApi
          .getAllDoctorSchedules(doctor.userId)
          .then((schedules) => ({
            doctorId: doctor.userId,
            schedules,
          })),
      ),
    );

    const merged: RoomScheduleResponse[] = [];
    for (const item of settled) {
      if (item.status === "fulfilled") {
        merged.push(...(item.value.schedules || []));
      }
    }

    const uniqueById = new Map<number, RoomScheduleResponse>();
    for (const schedule of merged) {
      uniqueById.set(schedule.roomScheduleId, schedule);
    }

    return Array.from(uniqueById.values()).sort(
      (a, b) => a.roomScheduleId - b.roomScheduleId,
    );
  }

  async function fetchData() {
    setIsLoading(true);
    try {
      const [roomsData, doctorsData] = await Promise.all([
        getRooms().catch(() => []),
        apiRequest<UserOption[]>("/users/role/3", {
          method: "GET",
          cache: "no-store",
        }).catch(() => []),
      ]);

      const schedulesData = await getAllSchedulesForDoctors(doctorsData || []);

      setSchedules(schedulesData);
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
    const matchedRoom = rooms.find(
      (room) => String(room.roomNumber) === String(schedule.roomNumber),
    );

    const matchedDoctor = doctors.find(
      (doctor) =>
        normalizeDoctorName(getDoctorDisplayName(doctor)) ===
        normalizeDoctorName(schedule.doctorName),
    );

    setSelectedSchedule(schedule);
    setFormValues({
      roomId: matchedRoom?.roomId || 0,
      doctorId: matchedDoctor?.userId || 0,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      selectedDate: new Date().toISOString().split("T")[0],
    });

    if (!matchedRoom || !matchedDoctor) {
      toast.warning(
        "Could not fully prefill room/doctor. Please re-select before saving.",
      );
    }

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

      <Card className="border-border/60 bg-card/80 backdrop-blur mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Search schedules
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
          <div className="grid gap-2">
            <Label htmlFor="schedule-search">Quick search</Label>
            <Input
              id="schedule-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by room, doctor, day, or time"
            />
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            {filteredSchedules.length} of {schedules.length} schedules shown
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filteredSchedules}
        pageable={true}
        pageSize={10}
        showActions={false}
        emptyMessage="No schedules found"
      />

      <StyledDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={selectedSchedule ? "Edit Room Schedule" : "Create Room Schedule"}
        size="lg"
        footer={
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {selectedSchedule ? "Save Changes" : "Create Schedule"}
            </Button>
          </div>
        }
      >
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
                  <SelectItem key={doctor.userId} value={String(doctor.userId)}>
                    {getDoctorDisplayName(doctor)}
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
      </StyledDialog>

      <StyledDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Schedule"
        size="md"
        footer={
          <div className="space-x-2">
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
          </div>
        }
      >
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
      </StyledDialog>
    </div>
  );
}
