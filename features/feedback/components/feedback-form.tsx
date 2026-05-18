"use client";

import { useForm } from "@tanstack/react-form";
import { Loader2, Send, Star } from "lucide-react";
import { toast } from "sonner";

import { Button, Input, Label, Textarea } from "@/components/ui";
import { formatValidationErrors, getErrorMessage } from "@/lib/utils";
import { feedbackApi } from "../api/feedback.api";
import {
  feedbackCreateSchema,
  type FeedbackCreateValues,
} from "../schemas/feedback.schema";

interface FeedbackFormProps {
  patientId: number;
  onCreated?: () => void;
}

const initialValues: FeedbackCreateValues = {
  appointmentId: 0,
  patientId: 0,
  doctorId: 0,
  rating: 0,
  comments: "",
};

export function FeedbackForm({ patientId, onCreated }: FeedbackFormProps) {
  const form = useForm({
    defaultValues: {
      ...initialValues,
      patientId,
    },
    validators: {
      onSubmit: feedbackCreateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = feedbackCreateSchema.parse({
          ...value,
          comments: value.comments?.trim() || undefined,
        });

        await feedbackApi.create(payload);
        toast.success("Feedback submitted", {
          description: "Thank you for sharing your appointment experience.",
        });
        form.reset();
        form.setFieldValue("patientId", patientId);
        onCreated?.();
      } catch (error) {
        toast.error("Could not submit feedback", {
          description: getErrorMessage(error),
        });
      }
    },
  });

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border/60 bg-muted/30 px-6 py-4">
        <h2 className="text-base font-semibold">Create Feedback</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your appointment ID, doctor ID, rating, and comments.
        </p>
      </div>
      <div className="p-6">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <form.Field
              name="appointmentId"
              validators={{ onChange: feedbackCreateSchema.shape.appointmentId }}
            >
              {(field) => (
                <div className="grid gap-2">
                  <Label className="form-label mb-0" htmlFor={field.name}>
                    Appointment ID *
                  </Label>
                  <Input
                    id={field.name}
                    min={1}
                    type="number"
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(Number(event.target.value))
                    }
                    placeholder="Enter appointment ID"
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
              name="doctorId"
              validators={{ onChange: feedbackCreateSchema.shape.doctorId }}
            >
              {(field) => (
                <div className="grid gap-2">
                  <Label className="form-label mb-0" htmlFor={field.name}>
                    Doctor ID *
                  </Label>
                  <Input
                    id={field.name}
                    min={1}
                    type="number"
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(Number(event.target.value))
                    }
                    placeholder="Enter doctor ID"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="form-error">
                      {formatValidationErrors(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="patientId">
            {(field) => (
              <input type="hidden" value={field.state.value} readOnly />
            )}
          </form.Field>

          <form.Field
            name="rating"
            validators={{ onChange: feedbackCreateSchema.shape.rating }}
          >
            {(field) => (
              <div className="grid gap-3">
                <Label className="form-label mb-0">Rating *</Label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      size="sm"
                      variant={field.state.value === rating ? "default" : "outline"}
                      onClick={() => field.handleChange(rating)}
                    >
                      <Star
                        className={
                          field.state.value >= rating
                            ? "fill-current text-current"
                            : ""
                        }
                      />
                      {rating}
                    </Button>
                  ))}
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="form-error">
                    {formatValidationErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="comments"
            validators={{ onChange: feedbackCreateSchema.shape.comments }}
          >
            {(field) => (
              <div className="grid gap-2">
                <Label className="form-label mb-0" htmlFor={field.name}>
                  Comments
                </Label>
                <Textarea
                  id={field.name}
                  maxLength={255}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Tell us what went well or what could improve"
                  rows={4}
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
              state.values.appointmentId,
              state.values.patientId,
              state.values.doctorId,
              state.values.rating,
              state.canSubmit,
              state.isSubmitting,
            ]}
          >
            {([
              appointmentId,
              currentPatientId,
              doctorId,
              rating,
              canSubmit,
              isSubmitting,
            ]) => {
              const hasRequiredFields =
                Number(appointmentId) > 0 &&
                Number(currentPatientId) > 0 &&
                Number(doctorId) > 0 &&
                Number(rating) > 0;

              if (!hasRequiredFields) {
                return null;
              }

              return (
                <Button
                  type="submit"
                  disabled={!Boolean(canSubmit) || Boolean(isSubmitting)}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit Feedback
                </Button>
              );
            }}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
}
