"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { CalendarClock, Loader2, Send, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui";
import { formatValidationErrors, getErrorMessage } from "@/lib/utils";
import { appointmentApi } from "../api/appointment.api";
import { appointmentCreateSchema } from "../schemas/appointment.schema";
import type { AppointmentType } from "../types/appointment.types";
import {
  doctorApi,
  getDoctorOptionLabel,
  type DoctorResponse,
} from "@/features/doctors/api/doctor.api";

interface AppointmentFormProps {
  patientId: number;
  onCreated?: () => void;
  onCancel?: () => void;
}

const appointmentTypes: Array<{
  value: AppointmentType;
  label: string;
}> = [
  { value: "CONSULTATION", label: "Consultation" },
  { value: "FOLLOW_UP", label: "Follow up" },
  { value: "ROUTINE_CHECKUP", label: "Routine checkup" },
  { value: "EMERGENCY", label: "Emergency" },
];

interface AppointmentFormValues {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  notes?: string;
}

type NormalizedDoctor = DoctorResponse & {
  doctorId: number;
  specialization: string;
  consultationFee: number;
};

function normalizeDoctor(doctor: DoctorResponse): NormalizedDoctor {
  return {
    ...doctor,
    doctorId: Number(doctor.doctorId),
    specialization: String(doctor.specialization ?? "")
      .trim()
      .toUpperCase(),
    consultationFee: Number(doctor.consultationFee),
  };
}

interface AvailableSlotsSectionProps {
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  onAppointmentTimeChange: (value: string) => void;
}

function AvailableSlotsSection({
  doctorId,
  appointmentDate,
  appointmentTime,
  onAppointmentTimeChange,
}: AvailableSlotsSectionProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const onAppointmentTimeChangeRef = useRef(onAppointmentTimeChange);

  useEffect(() => {
    onAppointmentTimeChangeRef.current = onAppointmentTimeChange;
  }, [onAppointmentTimeChange]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!doctorId || doctorId <= 0 || !appointmentDate) {
        setAvailableSlots([]);
        onAppointmentTimeChangeRef.current("");
        return;
      }

      try {
        setIsLoadingSlots(true);

        const slots = await appointmentApi.getAvailableSlots(
          doctorId,
          appointmentDate,
        );

        setAvailableSlots(slots);
        onAppointmentTimeChangeRef.current("");
      } catch (error) {
        setAvailableSlots([]);

        toast.error("Could not load available slots", {
          description: getErrorMessage(error),
        });
      } finally {
        setIsLoadingSlots(false);
      }
    };

    loadSlots();
  }, [doctorId, appointmentDate]);

  return (
    <div className="grid gap-2">
      <Label>Available Time Slots *</Label>

      {isLoadingSlots ? (
        <div className="flex h-10 items-center rounded-md border px-3 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading available slots...
        </div>
      ) : availableSlots.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availableSlots.map((slot) => (
            <Button
              key={slot}
              type="button"
              variant={appointmentTime === slot ? "default" : "outline"}
              className="h-9"
              onClick={() => onAppointmentTimeChange(slot)}
            >
              {slot.slice(0, 5)}
            </Button>
          ))}
        </div>
      ) : (
        <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {doctorId > 0 && appointmentDate
            ? "No available slots for this date."
            : "Select doctor and date to view available slots."}
        </div>
      )}
    </div>
  );
}

export function AppointmentForm({
  patientId,
  onCreated,
  onCancel,
}: AppointmentFormProps) {
  const [doctors, setDoctors] = useState<NormalizedDoctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  const defaultValues: AppointmentFormValues = {
    patientId,
    doctorId: 0,
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "CONSULTATION",
    notes: "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: appointmentCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = appointmentCreateSchema.parse({
          ...value,
          patientId,
          notes: value.notes?.trim() || undefined,
        });

        await appointmentApi.create({
          ...payload,
          appointmentType: payload.appointmentType as AppointmentType,
        });

        toast.success("Appointment scheduled", {
          description: "Your appointment request has been submitted.",
        });

        form.reset();
        form.setFieldValue("patientId", patientId);
        setSelectedSpecialization("");

        onCreated?.();
      } catch (error) {
        toast.error("Could not schedule appointment", {
          description: getErrorMessage(error),
        });
      }
    },
  });

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setIsLoadingDoctors(true);

        const response = await doctorApi.getOptions();
        setDoctors(
          response
            .map(normalizeDoctor)
            .filter(
              (doctor) =>
                doctor.isActive && doctor.doctorId > 0 && doctor.specialization,
            ),
        );
      } catch (error) {
        toast.error("Could not load doctors", {
          description: getErrorMessage(error),
        });
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, []);

  const specializations = useMemo(() => {
    return Array.from(new Set(doctors.map((doctor) => doctor.specialization)));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!selectedSpecialization) {
      return [];
    }

    const normalizedSpecialization = selectedSpecialization
      .trim()
      .toUpperCase();

    return doctors.filter(
      (doctor) => doctor.specialization === normalizedSpecialization,
    );
  }, [doctors, selectedSpecialization]);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="patientId">
        {(field) => <input type="hidden" value={field.state.value} readOnly />}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Specialization *</Label>

          <Select
            value={selectedSpecialization}
            onValueChange={(value) => {
              setSelectedSpecialization(value);
              form.setFieldValue("doctorId", 0);
              form.setFieldValue("appointmentTime", "");
            }}
            disabled={isLoadingDoctors}
          >
            <SelectTrigger className="w-full">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <SelectValue
                placeholder={
                  isLoadingDoctors
                    ? "Loading specializations..."
                    : "Select specialization"
                }
              />
            </SelectTrigger>

            <SelectContent
              position="popper"
              align="start"
              className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
            >
              {specializations.map((specialization) => (
                <SelectItem key={specialization} value={specialization}>
                  {specialization.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form.Field
          name="doctorId"
          validators={{ onChange: appointmentCreateSchema.shape.doctorId }}
        >
          {(field) => (
            <div className="grid gap-2">
              <Label>Doctor *</Label>

              <Select
                value={field.state.value ? String(field.state.value) : ""}
                onValueChange={(value) => {
                  field.handleChange(Number(value));
                  form.setFieldValue("appointmentTime", "");
                }}
                disabled={
                  !selectedSpecialization || filteredDoctors.length === 0
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedSpecialization
                        ? "Select doctor"
                        : "Select specialization first"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {filteredDoctors.map((doctor) => (
                    <SelectItem
                      key={doctor.doctorId}
                      value={String(doctor.doctorId)}
                    >
                      {getDoctorOptionLabel(doctor)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {field.state.meta.errors.length > 0 && (
                <p className="form-error">
                  {formatValidationErrors(field.state.meta.errors)}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="appointmentDate"
          validators={{
            onChange: appointmentCreateSchema.shape.appointmentDate,
          }}
        >
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Date *</Label>

              <Input
                id={field.name}
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                  form.setFieldValue("appointmentTime", "");
                }}
              />

              {field.state.meta.errors.length > 0 && (
                <p className="form-error">
                  {formatValidationErrors(field.state.meta.errors)}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="appointmentType"
          validators={{
            onChange: appointmentCreateSchema.shape.appointmentType,
          }}
        >
          {(field) => (
            <div className="grid gap-2">
              <Label>Appointment Type *</Label>

              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger className="w-full">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>

                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {field.state.meta.errors.length > 0 && (
                <p className="form-error">
                  {formatValidationErrors(field.state.meta.errors)}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => [
          state.values.doctorId,
          state.values.appointmentDate,
          state.values.appointmentTime,
        ]}
      >
        {([doctorId, appointmentDate, appointmentTime]) => (
          <AvailableSlotsSection
            doctorId={Number(doctorId)}
            appointmentDate={String(appointmentDate)}
            appointmentTime={String(appointmentTime)}
            onAppointmentTimeChange={(value) =>
              form.setFieldValue("appointmentTime", value)
            }
          />
        )}
      </form.Subscribe>

      <form.Field
        name="notes"
        validators={{ onChange: appointmentCreateSchema.shape.notes }}
      >
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>Notes</Label>

            <Textarea
              id={field.name}
              maxLength={255}
              rows={4}
              value={field.state.value || ""}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Add symptoms or anything the doctor should know"
            />

            <div className="flex justify-between gap-3 text-xs text-muted-foreground">
              <span>
                {field.state.meta.errors.length > 0
                  ? formatValidationErrors(field.state.meta.errors)
                  : "Optional, up to 255 characters"}
              </span>
              <span>{field.state.value?.length || 0}/255</span>
            </div>
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => [
          state.values.doctorId,
          state.values.appointmentDate,
          state.values.appointmentTime,
          state.values.appointmentType,
          state.canSubmit,
          state.isSubmitting,
        ]}
      >
        {([
          doctorId,
          appointmentDate,
          appointmentTime,
          appointmentType,
          canSubmit,
          isSubmitting,
        ]) => {
          const hasRequiredFields =
            Number(doctorId) > 0 &&
            String(appointmentDate).trim().length > 0 &&
            String(appointmentTime).trim().length > 0 &&
            String(appointmentType).trim().length > 0;

          return (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={Boolean(isSubmitting)}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                disabled={
                  !hasRequiredFields ||
                  !Boolean(canSubmit) ||
                  Boolean(isSubmitting)
                }
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <p>Schedule Appointment</p>
                )}
              </Button>
            </div>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
