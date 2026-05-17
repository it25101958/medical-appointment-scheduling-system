"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, IdCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { formatValidationErrors } from "@/lib/utils";
import { patientRegisterFormSchema } from "@/lib/validations/auth";
import { registerAction } from "@/lib/actions/register-action";

export function RegisterForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      nic: "",
      dateOfBirth: "",
      gender: "MALE",
      address: "",
      emergencyContact: "",
      bloodGroup: "O_POSITIVE",
      allergies: "",
    },
    validators: {
      onSubmit: patientRegisterFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await registerAction(value);

        if (result.success) {
          toast.success("Registration successful!", {
            description: "Check your email for the verification code.",
          });

          setTimeout(() => {
            router.push(
              `/auth/verify?email=${encodeURIComponent(value.email)}`,
            );
          }, 1000);
        } else {
          toast.error("Registration failed", {
            description: result.error || "Please try again",
          });
        }
      } catch {
        toast.error("An error occurred", {
          description: "Please try again later",
        });
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4 w-full max-w-2xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        {/* First Name */}
        <form.Field
          name="firstName"
          validators={{ onChange: patientRegisterFormSchema.shape.firstName }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-xs font-medium">
                First Name
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <User className="size-3.5 text-muted-foreground/60" />
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  type="text"
                  placeholder="John"
                  className="h-9 text-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </InputGroup>
              <div className="min-h-4 mt-0.5">
                {field.state.meta.errors && (
                  <p className="form-error text-[11px] text-destructive">
                    {formatValidationErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            </Field>
          )}
        </form.Field>

        {/* Last Name */}
        <form.Field
          name="lastName"
          validators={{ onChange: patientRegisterFormSchema.shape.lastName }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-xs font-medium">
                Last Name
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <User className="size-3.5 text-muted-foreground/60" />
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  type="text"
                  placeholder="Doe"
                  className="h-9 text-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </InputGroup>
              <div className="min-h-4 mt-0.5">
                {field.state.meta.errors && (
                  <p className="form-error text-[11px] text-destructive">
                    {formatValidationErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            </Field>
          )}
        </form.Field>

        {/* Email Address */}
        <form.Field
          name="email"
          validators={{ onChange: patientRegisterFormSchema.shape.email }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-xs font-medium">
                Email Address
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Mail className="size-3.5 text-muted-foreground/60" />
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  type="email"
                  placeholder="john@example.com"
                  className="h-9 text-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </InputGroup>
              <div className="min-h-4 mt-0.5">
                {field.state.meta.errors && (
                  <p className="form-error text-[11px] text-destructive">
                    {formatValidationErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            </Field>
          )}
        </form.Field>

        {/* Password */}
        <form.Field
          name="password"
          validators={{ onChange: patientRegisterFormSchema.shape.password }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-xs font-medium">
                Password
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Lock className="size-3.5 text-muted-foreground/60" />
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  type="password"
                  placeholder="••••••••"
                  className="h-9 text-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </InputGroup>
              <div className="min-h-4 mt-0.5">
                {field.state.meta.errors && (
                  <p className="form-error text-[11px] text-destructive">
                    {formatValidationErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            </Field>
          )}
        </form.Field>

        {/* Phone */}
        <form.Field
          name="phone"
          validators={{ onChange: patientRegisterFormSchema.shape.phone }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-xs font-medium">
                Phone
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Phone className="size-3.5 text-muted-foreground/60" />
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  type="tel"
                  placeholder="+1234567890"
                  className="h-9 text-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </InputGroup>
              <div className="min-h-4 mt-0.5">
                {field.state.meta.errors && (
                  <p className="form-error text-[11px] text-destructive">
                    {formatValidationErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            </Field>
          )}
        </form.Field>

        {/* NIC */}
        <form.Field
          name="nic"
          validators={{ onChange: patientRegisterFormSchema.shape.nic }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-xs font-medium">
                NIC
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <IdCard className="size-3.5 text-muted-foreground/60" />
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  type="text"
                  placeholder="123456789V"
                  className="h-9 text-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </InputGroup>
              <div className="min-h-4 mt-0.5">
                {field.state.meta.errors && (
                  <p className="form-error text-[11px] text-destructive">
                    {formatValidationErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            </Field>
          )}
        </form.Field>

        {/* Date of Birth */}
        <form.Field
          name="dateOfBirth"
          validators={{ onChange: patientRegisterFormSchema.shape.dateOfBirth }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-xs font-medium">
                Date of Birth
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  type="date"
                  className="h-9 text-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </InputGroup>
              <div className="min-h-4 mt-0.5">
                {field.state.meta.errors && (
                  <p className="form-error text-[11px] text-destructive">
                    {formatValidationErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            </Field>
          )}
        </form.Field>

        {/* Gender */}
        <form.Field name="gender">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-xs font-medium">
                Gender
              </FieldLabel>
              <select
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
          )}
        </form.Field>

        {/* Address */}
        <form.Field
          name="address"
          validators={{ onChange: patientRegisterFormSchema.shape.address }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-xs font-medium">
                Address
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  type="text"
                  placeholder="123 Main St, City"
                  className="h-9 text-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </InputGroup>
              <div className="min-h-4 mt-0.5">
                {field.state.meta.errors && (
                  <p className="form-error text-[11px] text-destructive">
                    {formatValidationErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            </Field>
          )}
        </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => [
          state.values.email,
          state.values.password,
          state.values.firstName,
          state.values.lastName,
          state.values.phone,
          state.values.nic,
          state.values.dateOfBirth,
          state.values.gender,
          state.values.address,
          state.canSubmit,
          state.isSubmitting,
        ]}
      >
        {([
          email,
          password,
          firstName,
          lastName,
          phone,
          nic,
          dateOfBirth,
          gender,
          address,
          canSubmit,
          isSubmitting,
        ]) => {
          const hasRequiredFields = [
            email,
            password,
            firstName,
            lastName,
            phone,
            nic,
            dateOfBirth,
            gender,
            address,
          ].every((value) => String(value).trim().length > 0);

          const isDisabled = !hasRequiredFields || !canSubmit || isSubmitting;

          return (
            <Button
              type="submit"
              className="w-full h-10 mt-2"
              disabled={Boolean(isDisabled)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
