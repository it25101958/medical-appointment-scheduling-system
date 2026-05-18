"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SearchBar } from "@/components/ui/search-bar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { highlightText } from "@/lib/highlight-search";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Boxes,
  DoorOpen,
  Edit3,
  Hash,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Room,
  RoomPayload,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "@/lib/services/room-service";

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formValues, setFormValues] = useState<RoomPayload>({
    roomNumber: "",
    roomType: "",
    capacity: 0,
    equipmentAvailable: "",
    status: "AVAILABLE",
  });

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredRooms = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return rooms;
    return rooms.filter((room) => {
      const haystack = [
        room.roomNumber,
        room.roomType,
        room.capacity?.toString(),
        room.equipmentAvailable,
        room.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [deferredSearchQuery, rooms]);

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    setIsLoading(true);
    try {
      const data = await getRooms();
      setRooms(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateDialog() {
    setSelectedRoom(null);
    setFormValues({
      roomNumber: "",
      roomType: "",
      capacity: 0,
      equipmentAvailable: "",
      status: "AVAILABLE",
    });
    setDialogOpen(true);
  }

  function openEditDialog(room: Room) {
    setSelectedRoom(room);
    setFormValues({
      roomNumber: (room.roomNumber as string) || "",
      roomType: (room.roomType as string) || "",
      capacity: (room.capacity as number) || 0,
      equipmentAvailable: (room.equipmentAvailable as string) || "",
      status: (room.status as string) || "AVAILABLE",
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(room: Room) {
    setSelectedRoom(room);
    setDeleteOpen(true);
  }

  async function handleSave() {
    if (!formValues.roomNumber.trim()) {
      toast.error("Room number is required.");
      return;
    }
    if (!formValues.roomType.trim()) {
      toast.error("Room type is required.");
      return;
    }
    if (formValues.capacity <= 0) {
      toast.error("Capacity must be greater than 0.");
      return;
    }

    setIsSaving(true);
    try {
      if (selectedRoom) {
        await updateRoom(selectedRoom.roomId, formValues);
        toast.success("Room updated successfully.");
      } else {
        await createRoom(formValues);
        toast.success("Room created successfully.");
      }
      setDialogOpen(false);
      await fetchRooms();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedRoom) return;
    setIsDeleting(true);
    try {
      await deleteRoom(selectedRoom.roomId);
      toast.success("Room removed successfully.");
      setDeleteOpen(false);
      await fetchRooms();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="col-start-1 col-end-14">
      <PageHeader
        title="Manage Rooms"
        description="Create, update, delete, and view all available room records."
        actions={
          <>
            <Button onClick={fetchRooms} size="sm" variant="outline">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4" /> New Room
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by room number, type, equipment, or status"
          resultCount={filteredRooms.length}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <ScrollArea className="bg-card rounded-lg border-b border-border overflow-x-auto">
          <table className="min-w-[950px] w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Room ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Number
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Capacity
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Equipment
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
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
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    Loading rooms...
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No rooms found.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr
                    key={room.roomId}
                    className="border-t border-border hover:bg-muted/20"
                  >
                    <td className="px-4 py-4 font-medium text-muted-foreground">
                      {room.roomId}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {highlightText(
                        (room.roomNumber as string) || "—",
                        deferredSearchQuery,
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {highlightText(
                        (room.roomType as string) || "—",
                        deferredSearchQuery,
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {(room.capacity as number) || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {highlightText(
                        (room.equipmentAvailable as string) || "—",
                        deferredSearchQuery,
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {(room.status as string) || "AVAILABLE"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="icon-sm"
                          variant="outline"
                          onClick={() => openEditDialog(room)}
                          aria-label="Edit room"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          onClick={() => openDeleteDialog(room)}
                          aria-label="Delete room"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[640px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DoorOpen className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    {selectedRoom ? "Edit Room" : "Create Room"}
                  </DialogTitle>
                  <DialogDescription>
                    Manage room details, equipment, capacity, and status.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-sm font-medium leading-none">Room Details</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Keep rooms clearly identified for schedules and appointments.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="room-number">
                Room Number
              </Label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="room-number"
                className="pl-9"
                value={formValues.roomNumber}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    roomNumber: event.target.value,
                  }))
                }
                placeholder="e.g., 101, 202, A-03"
              />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="room-type">
                Room Type
              </Label>
              <div className="relative">
                <DoorOpen className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="room-type"
                className="pl-9"
                value={formValues.roomType}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    roomType: event.target.value,
                  }))
                }
                placeholder="e.g., Consulting, Lab, Ward"
              />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="room-capacity">
                Capacity
              </Label>
              <div className="relative">
                <Boxes className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="room-capacity"
                type="number"
                className="pl-9"
                value={formValues.capacity}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    capacity: parseInt(event.target.value) || 0,
                  }))
                }
                placeholder="Enter capacity (e.g., 2, 4, 6)"
              />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="equipment-available">
                Equipment Available
              </Label>
              <div className="relative">
                <Boxes className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="equipment-available"
                className="pl-9"
                value={formValues.equipmentAvailable}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    equipmentAvailable: event.target.value,
                  }))
                }
                placeholder="e.g., ECG Machine, Monitor"
              />
              </div>
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label className="form-label mb-0" htmlFor="room-status">
                Status
              </Label>
              <Select
                value={formValues.status}
                onValueChange={(value) =>
                  setFormValues((current) => ({
                    ...current,
                    status: value,
                  }))
                }
              >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                >
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {selectedRoom ? "Save changes" : "Create room"}
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
                    Delete Room
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove this room?
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
              <p className="font-medium">
                {selectedRoom?.roomType || "Room"} (ID: {selectedRoom?.roomId})
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Capacity: {selectedRoom?.capacity} | Status:{" "}
                {selectedRoom?.status}
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
