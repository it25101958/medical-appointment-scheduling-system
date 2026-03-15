"use client";

import { useForm } from "@tanstack/react-form";
import { loginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function LoginForm() {
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch("/api/proxy/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        if (!response.ok) throw new Error("Invalid credentials");
        toast.success("Login successful!");
      } catch (error) {
        toast.error("Authentication Failed", {
          description: "Please check your credentials.",
        });
      }
    },
  });

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
        <form.Field
          name="email"
          validators={{ onChange: loginSchema.shape.email }}
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Mail className="size-4 text-muted-foreground/60" />
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  placeholder="doctor@healthflow.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="email"
                />
              </InputGroup>
              {field.state.meta.errors && (
                <p className="text-[11px] font-medium text-destructive mt-1">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </Field>
          )}
        </form.Field>
        <form.Field
          name="password"
          validators={{ onChange: loginSchema.shape.password }}
        >
          {(field) => (
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              </div>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Lock className="size-4 text-muted-foreground/60" />
                </InputGroupAddon>
                <InputGroupInput
                  id={field.name}
                  type="password"
                  placeholder="••••••••"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </InputGroup>
              {field.state.meta.errors && (
                <p className="text-[11px] font-medium text-destructive mt-1">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </Field>
          )}
        </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
