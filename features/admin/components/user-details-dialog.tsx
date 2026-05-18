"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { apiRequest } from "@/lib/api-client";
import { formatValidationErrors, getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getRoleBadgeClass, getStatusBadgeClass } from "@/lib/theme";
import { Hash, Mail, MapPin, Phone, UserCog, User2 } from "lucide-react";
import * as z from "zod";

// --- Zod schema for editable fields
const userUpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
});

export interface UserDetails {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  NIC: string;
  address: string;
  isActive: boolean;
  roleType: number;
  roleName?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserDetailsDialogProps {
  userId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function UserDetailsDialog({
  userId,
  open,
  onOpenChange,
  onUpdated,
}: UserDetailsDialogProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    defaultValues: { firstName: "", lastName: "", phone: "", address: "" },
    onSubmit: async ({ value }) => {
      if (!user) return;
      setSaving(true);
      try {
        await apiRequest(`/users/${user.userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });
        toast.success("User updated successfully");
        onUpdated?.();
        onOpenChange(false);
      } catch (err: unknown) {
        console.log(err);
        toast.error(getErrorMessage(err, "Failed to update user"));
      } finally {
        setSaving(false);
      }
    },
    validators: { onSubmit: userUpdateSchema },
  });

  useEffect(() => {
    if (!userId || !open) return;
    async function fetchUser() {
      setLoading(true);
      console.log(userId);
      try {
        const data: UserDetails = await apiRequest(`/users/${userId}`);
        setUser({
          ...data,
          roleName: data.roleName || getRoleName(data.roleType),
        });
        form.setFieldValue("firstName", data.firstName);
        form.setFieldValue("lastName", data.lastName);
        form.setFieldValue("phone", data.phone);
        form.setFieldValue("address", data.address);
      } catch {
        toast.error("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId, open]);

  function getRoleName(roleType: number) {
    const ROLE_MAP: Record<number, string> = {
      1: "ADMIN",
      2: "STAFF",
      3: "DOCTOR",
      4: "PATIENT",
    };
    return ROLE_MAP[roleType] || "UNKNOWN";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[760px]">
        <DialogHeader>
          <div className="border-b border-border/60 px-6 pb-5 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserCog className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Update User
                </DialogTitle>
                <DialogDescription>
                  Review account details and edit user contact information.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">
            Loading user...
          </p>
        ) : user ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            <div className="space-y-5 px-6">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      User ID #{user.userId}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={getRoleBadgeClass()}>{user.roleName}</span>
                    <span className={getStatusBadgeClass(user.isActive)}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field
                  name="firstName"
                  validators={{ onChange: userUpdateSchema.shape.firstName }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel>First Name</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <User2 className="size-4 text-muted-foreground/60" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="First Name"
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
                  name="lastName"
                  validators={{ onChange: userUpdateSchema.shape.lastName }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel>Last Name</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <User2 className="size-4 text-muted-foreground/60" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Last Name"
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
                  name="phone"
                  validators={{ onChange: userUpdateSchema.shape.phone }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel>Phone</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <Phone className="size-4 text-muted-foreground/60" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Phone Number"
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
                  name="address"
                  validators={{ onChange: userUpdateSchema.shape.address }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel>Address</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <MapPin className="size-4 text-muted-foreground/60" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Address"
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

                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Mail className="size-4 text-muted-foreground/60" />
                    </InputGroupAddon>
                    <InputGroupInput value={user.email} disabled />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel>NIC</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Hash className="size-4 text-muted-foreground/60" />
                    </InputGroupAddon>
                    <InputGroupInput value={user.NIC} disabled />
                  </InputGroup>
                </Field>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Created At
                  </span>
                  <p className="mt-1 text-foreground">
                    {new Date(user.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Updated At
                  </span>
                  <p className="mt-1 text-foreground">
                    {new Date(user.updatedAt).toLocaleString()}
                  </p>
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
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <p className="px-6 pb-6 text-sm text-muted-foreground">
            User not found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
