"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  DataTable,
  PageHeader,
  SearchBar,
  Label,
  Input,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import type { Column } from "@/components/ui";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { highlightText } from "@/lib/highlight-search";
import {
  Calendar,
  CalendarClock,
  Clock,
  DoorOpen,
  Edit3,
  Plus,
  RefreshCcw,
  Stethoscope,
  Trash2,
} from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchedule, setSelectedSchedule] =
    useState<RoomScheduleResponse | null>(null);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const openEditDialog = useCallback(
    (schedule: RoomScheduleResponse) => {
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
    },
    [doctors, rooms],
  );

  const openDeleteDialog = useCallback((schedule: RoomScheduleResponse) => {
    setSelectedSchedule(schedule);
    setDeleteOpen(true);
  }, []);

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSchedules.length / pageSize),
  );

  const paginatedSchedules = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredSchedules.slice(start, start + pageSize);
  }, [currentPage, filteredSchedules, pageSize]);

  const columns = useMemo<Column<RoomScheduleResponse>[]>(
    () => [
      {
        header: "Schedule ID",
        className:
          "w-[80px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground",
        render: (schedule) =>
          highlightText(
            schedule.roomScheduleId?.toString() || "",
            deferredSearchQuery,
          ),
      },
      {
        header: "Room",
        className:
          "w-[180px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground",
        render: (schedule) =>
          highlightText(
            `Room ${String(schedule.roomNumber ?? "")}`,
            deferredSearchQuery,
          ),
      },
      {
        header: "Doctor",
        className:
          "w-[220px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground",
        render: (schedule) =>
          highlightText(schedule.doctorName || "", deferredSearchQuery),
      },
      {
        header: "Day",
        className:
          "w-[140px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground",
        render: (schedule) =>
          highlightText(schedule.dayOfWeek || "", deferredSearchQuery),
      },
      {
        header: "Time Slot",
        className:
          "w-[160px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground",
        render: (schedule) =>
          highlightText(
            `${schedule.startTime} - ${schedule.endTime}`,
            deferredSearchQuery,
          ),
      },
      {
        header: "Actions",
        className:
          "w-[120px] px-4 py-2 text-center text-xs font-medium tracking-wide text-muted-foreground",
        render: (schedule) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => openEditDialog(schedule)}
              aria-label="Edit room schedule"
              title="Edit"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="destructive"
              onClick={() => openDeleteDialog(schedule)}
              aria-label="Delete room schedule"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [deferredSearchQuery, openDeleteDialog, openEditDialog],
  );

  const [formValues, setFormValues] = useState<FormValues>({
    roomId: 0,
    doctorId: 0,
    dayOfWeek: "MONDAY",
    startTime: "",
    endTime: "",
    selectedDate: new Date().toISOString().split("T")[0],
  });

  function normalizeDoctorName(name: string): string {
    return name
      .replace(/^dr\.?\s*/i, "")
      .trim()
      .toLowerCase();
  }

  function getDoctorDisplayName(doctor: UserOption): string {
    return `Dr. ${doctor.lastName}`;
  }

  const fetchData = useCallback(async () => {
    try {
      const [roomsData, doctorsData] = await Promise.all([
        getRooms().catch(() => []),
        apiRequest<UserOption[]>("/users/role/3", {
          method: "GET",
          cache: "no-store",
        }).catch(() => []),
      ]);
      const allSchedules = await roomScheduleApi.getAll().catch(() => []);

      setSchedules(allSchedules || []);
      setCurrentPage(0);
      setRooms(roomsData || []);
      setDoctors(doctorsData || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      <PageHeader
        title="Manage Room Schedules"
        description="Assign doctors to rooms for specific time slots across the week."
        actions={
          <>
            <Button onClick={() => fetchData()} size="sm" variant="outline">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4" /> New Schedule
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by room, doctor, day, or time"
          resultCount={filteredSchedules.length}
        />
      </div>

      <div className="overflow-hidden w-auto rounded-lg border border-border bg-card">
        <DataTable
          columns={columns}
          data={paginatedSchedules}
          pageable={false}
          showActions={false}
          emptyMessage="No schedules found"
        />

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20, 50]}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(0);
          }}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[640px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarClock className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    {selectedSchedule
                      ? "Edit Room Schedule"
                      : "Create Room Schedule"}
                  </DialogTitle>
                  <DialogDescription>
                    Assign a doctor to a room for a specific working window.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="form-label mb-0" htmlFor="room-select">
                  Room *
                </Label>
                <Select
                  value={String(formValues.roomId)}
                  onValueChange={(value) =>
                    setFormValues((current) => ({
                      ...current,
                      roomId: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger id="room-select">
                    <DoorOpen className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                  >
                    {rooms.map((room) => (
                      <SelectItem key={room.roomId} value={String(room.roomId)}>
                        Room {String(room.roomNumber ?? "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="form-label mb-0" htmlFor="doctor-select">
                  Doctor *
                </Label>
                <Select
                  value={String(formValues.doctorId)}
                  onValueChange={(value) =>
                    setFormValues((current) => ({
                      ...current,
                      doctorId: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger id="doctor-select">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                  >
                    {doctors.map((doctor) => (
                      <SelectItem
                        key={doctor.userId}
                        value={String(doctor.userId)}
                      >
                        {getDoctorDisplayName(doctor)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start text-left font-normal"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="form-label mb-0" htmlFor="start-time">
                  Start Time *
                </Label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="start-time"
                    type="time"
                    className="pl-9"
                    value={formValues.startTime}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        startTime: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="form-label mb-0" htmlFor="end-time">
                  End Time *
                </Label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="end-time"
                    type="time"
                    className="pl-9"
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
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : selectedSchedule
                  ? "Save Changes"
                  : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="gap-5 border-border/60 bg-card p-0 shadow-xl sm:max-w-[460px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <Trash2 className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Delete Schedule
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove this room schedule?
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
              <p className="font-medium">
                Room {selectedSchedule?.roomNumber} -{" "}
                {selectedSchedule?.doctorName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selectedSchedule?.dayOfWeek} | {selectedSchedule?.startTime} -{" "}
                {selectedSchedule?.endTime}
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
