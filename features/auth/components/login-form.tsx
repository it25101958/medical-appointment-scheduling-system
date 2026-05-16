"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";
import { loginAction } from "@/lib/actions/auth-actions";
import { formatValidationErrors } from "@/lib/utils";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function LoginForm() {
  const router = useRouter();
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await loginAction(value);

      if (result.success) {
        const redirects: Record<number, string> = {
          1: "/admin/dashboard",
          2: "/staff/dashboard",
          3: "/doctor/dashboard",
          4: "/patient/dashboard",
        };

        const target = redirects[result.role as number] || "/patient/dashboard";
        router.push(target);
        router.refresh();
      } else {
        toast.error("Authentication Failed", {
          description: result.error || "Please check your credentials.",
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
                <p className="form-error">
                  {formatValidationErrors(field.state.meta.errors)}
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
                <p className="form-error">
                  {formatValidationErrors(field.state.meta.errors)}
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
