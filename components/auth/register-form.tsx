"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { useState } from "react";
import { doctorRegistrationSchema, doctorSchema } from "@/lib/validations/auth";

export function RegisterForm() {
  const [role, setRole] = useState("patient");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "patient",
    },
    onSubmit: async (values) => {
      console.log(values);
      toast.success("Registration successful!");
    },
  });

  const renderRoleSpecificFields = () => {
    switch (role) {
      case "doctor":
        return (
          <>
          <form.Field name="specialization"
            validators={{onChange: doctorSchema.shape.specialization}}
            >
                {(field) => (
                    <Field>
                        <FieldLabel htmlFor={field.name}>Specialization</FieldLabel>
                    </Field>
                )}
            </form.Field>
            <Field name="licenseNumber">
              <FieldLabel>License Number</FieldLabel>
              <InputGroup>
                <InputGroupInput type="text" placeholder="e.g. 12345" />
              </InputGroup>
            </Field>
          </>
        );
      case "staff":
        return (
          <>
            <Field name="status">
              <FieldLabel>Status</FieldLabel>
              <InputGroup>
                <InputGroupInput type="text" placeholder="e.g. Active" />
              </InputGroup>
            </Field>
          </>
        );
      case "admin":
        return (
          <>
            <Field name="department">
              <FieldLabel>Department</FieldLabel>
              <InputGroup>
                <InputGroupInput type="text" placeholder="e.g. IT" />
              </InputGroup>
            </Field>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <Field name="email">
          <FieldLabel>Email Address</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Mail className="size-4 text-muted-foreground/60" />
            </InputGroupAddon>
            <InputGroupInput
              type="email"
              placeholder="example@mail.com"
              value={field.state.value}
              onBlur={form.handleBlur}
              onChange={(e) => form.handleChange(e.target.value)}
            />
          </InputGroup>
        </Field>

        <Field name="password">
          <FieldLabel>Password</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Lock className="size-4 text-muted-foreground/60" />
            </InputGroupAddon>
            <InputGroupInput
              type="password"
              placeholder="••••••••"
              value={form.values.password}
              onBlur={form.handleBlur}
              onChange={(e) => form.handleChange(e.target.value)}
            />
          </InputGroup>
        </Field>

        {renderRoleSpecificFields()}
      </div>

      <Button type="submit" className="w-full" variant="primary">
        Register
      </Button>
    </form>
  );
}
