"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { getErrorMessage } from "@/lib/utils";

import { appointmentApi } from "../api/appointment.api";
import type {
  AppointmentResponse,
  AppointmentType,
  AppointmentUpdateRequest,
} from "../types/appointment.types";

const appointmentTypes: Array<{ value: AppointmentType; label: string }> = [
  { value: "CONSULTATION", label: "Consultation" },
  { value: "FOLLOW_UP", label: "Follow up" },
  { value: "ROUTINE_CHECKUP", label: "Routine checkup" },
  { value: "EMERGENCY", label: "Emergency" },
];

interface AppointmentEditDialogProps {
  appointment: AppointmentResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function AppointmentEditDialog({
  appointment,
  open,
  onOpenChange,
  onUpdated,
}: AppointmentEditDialogProps) {
  const [values, setValues] = useState({
    appointmentDate: "",
    appointmentTime: "",
    durationMinutes: "30",
    appointmentType: "CONSULTATION" as AppointmentType,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!appointment || !open) return;

    setValues({
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime?.slice(0, 5) || "",
      durationMinutes: String(appointment.durationMinutes || 30),
      appointmentType: appointment.appointmentType,
      notes: appointment.notes || "",
    });
  }, [appointment, open]);

  if (!appointment) return null;
  const currentAppointment = appointment;

  function updateValue<K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.appointmentDate || !values.appointmentTime) {
      toast.error("Date and time are required");
      return;
    }

    const payload: AppointmentUpdateRequest = {
      appointmentDate: values.appointmentDate,
      appointmentTime: values.appointmentTime,
      durationMinutes: Number(values.durationMinutes),
      appointmentType: values.appointmentType,
      notes: values.notes.trim() || undefined,
    };

    setSaving(true);
    try {
      await appointmentApi.update(currentAppointment.appointmentId, payload);
      toast.success("Appointment updated");
      onUpdated?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update appointment"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[680px]">
        <DialogHeader>
          <div className="border-b border-border/60 px-6 pb-5 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarClock className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Update Appointment
                </DialogTitle>
                <DialogDescription>
                  Edit schedule details for appointment #
                  {currentAppointment.appointmentNumber}.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-5 px-6">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium">
                    {currentAppointment.patient.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Doctor</p>
                  <p className="font-medium">
                    {currentAppointment.doctor.fullName}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="form-label mb-0" htmlFor="appointment-date">
                  Date *
                </Label>
                <Input
                  id="appointment-date"
                  type="date"
                  value={values.appointmentDate}
                  onChange={(event) =>
                    updateValue("appointmentDate", event.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label className="form-label mb-0" htmlFor="appointment-time">
                  Time *
                </Label>
                <Input
                  id="appointment-time"
                  type="time"
                  value={values.appointmentTime}
                  onChange={(event) =>
                    updateValue("appointmentTime", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="form-label mb-0" htmlFor="duration">
                  Duration Minutes *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={values.durationMinutes}
                  onChange={(event) =>
                    updateValue("durationMinutes", event.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label className="form-label mb-0">Appointment Type *</Label>
                <Select
                  value={values.appointmentType}
                  onValueChange={(value) =>
                    updateValue("appointmentType", value as AppointmentType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                  >
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="appointment-notes">
                Notes
              </Label>
              <Textarea
                id="appointment-notes"
                maxLength={255}
                rows={4}
                value={values.notes}
                onChange={(event) => updateValue("notes", event.target.value)}
                placeholder="Add appointment notes"
              />
              <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                <span>Optional, up to 255 characters</span>
                <span>{values.notes.length}/255</span>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
