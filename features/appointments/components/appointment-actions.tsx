// src/features/appointments/components/appointment-actions.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarX, CheckCircle2, MoreHorizontal, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { appointmentApi } from "../api/appointment.api";
import { AppointmentResponse } from "../types/appointment.types";
import { AppointmentEditDialog } from "./appointment-edit-dialog";

interface Props {
  appointment: AppointmentResponse;
  onChanged?: () => void;
}

export function AppointmentActions({ appointment, onChanged }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function handleConfirm() {
    try {
      await appointmentApi.updateStatus(appointment.appointmentId, {
        status: "SCHEDULED",
      });
      toast.success("Appointment confirmed");
      onChanged?.();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update appointment"));
    }
  }

  async function handleComplete() {
    try {
      await appointmentApi.updateStatus(appointment.appointmentId, {
        status: "COMPLETED",
      });
      toast.success("Appointment completed");
      onChanged?.();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update appointment"));
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await appointmentApi.cancel(appointment.appointmentId);
      toast.success("Appointment cancelled");
      setCancelOpen(false);
      onChanged?.();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to cancel appointment"));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleConfirm}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Schedule
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleComplete}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setCancelOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <CalendarX className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AppointmentEditDialog
        appointment={appointment}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={onChanged}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="gap-5 border-border/60 bg-card p-0 shadow-xl sm:max-w-[460px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <CalendarX className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Delete Appointment
                  </DialogTitle>
                  <DialogDescription>
                    This will cancel the appointment in the system.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-sm font-medium">
                Appointment #{appointment.appointmentNumber}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {appointment.appointmentDate} at {appointment.appointmentTime}
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelling}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
