// src/features/appointments/components/appointment-actions.tsx

"use client";

import { toast } from "sonner";
import { CalendarX, CheckCircle2, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { appointmentApi } from "../api/appointment.api";
import { AppointmentResponse } from "../types/appointment.types";

interface Props {
  appointment: AppointmentResponse;
  onChanged?: () => void;
}

export function AppointmentActions({ appointment, onChanged }: Props) {
  async function handleConfirm() {
    try {
      await appointmentApi.updateStatus(appointment.appointmentId, {
        status: "CONFIRMED",
      });
      toast.success("Appointment confirmed");
      onChanged?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update appointment");
    }
  }

  async function handleComplete() {
    try {
      await appointmentApi.updateStatus(appointment.appointmentId, {
        status: "COMPLETED",
      });
      toast.success("Appointment completed");
      onChanged?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update appointment");
    }
  }

  async function handleCancel() {
    try {
      await appointmentApi.cancel(appointment.appointmentId);
      toast.success("Appointment cancelled");
      onChanged?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to cancel appointment");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleConfirm}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Confirm
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleComplete}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Complete
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleCancel}
          className="text-destructive focus:text-destructive"
        >
          <CalendarX className="mr-2 h-4 w-4" />
          Cancel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
