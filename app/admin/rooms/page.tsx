"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SearchBar } from "@/components/ui/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { highlightText } from "@/lib/highlight-search";
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
import { Plus, RefreshCcw, Edit3, Trash2 } from "lucide-react";
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
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(room)}
                        >
                          <Edit3 className="h-4 w-4" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteDialog(room)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
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
              {selectedRoom ? "Edit Room" : "Create Room"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="room-number">Room Number</Label>
              <Input
                id="room-number"
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

            <div className="grid gap-2">
              <Label htmlFor="room-type">Room Type</Label>
              <Input
                id="room-type"
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

            <div className="grid gap-2">
              <Label htmlFor="room-capacity">Capacity</Label>
              <Input
                id="room-capacity"
                type="number"
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

            <div className="grid gap-2">
              <Label htmlFor="equipment-available">Equipment Available</Label>
              <Input
                id="equipment-available"
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

            <div className="grid gap-2">
              <Label htmlFor="room-status">Status</Label>
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
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="space-x-2">
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Delete Room
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Are you sure you want to remove this room?
            <div className="mt-3 rounded-lg border border-border bg-muted p-4 text-sm">
              <p className="font-medium">
                {selectedRoom?.roomType || "Room"} (ID: {selectedRoom?.roomId})
              </p>
              <p className="text-muted-foreground text-xs">
                Capacity: {selectedRoom?.capacity} | Status:{" "}
                {selectedRoom?.status}
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
              Delete room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
