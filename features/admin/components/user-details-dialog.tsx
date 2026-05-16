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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User2,
  Phone,
  MapPin,
  Mail,
  Hash,
} from "lucide-react";
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
      <DialogContent className="w-[50vw] max-w-none sm:!max-w-[1000px] max-h-[90vh] overflow-y-auto rounded-xl bg-card p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            User Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground p-4">Loading user...</p>
        ) : user ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Editable Fields */}
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
                      <p className="text-red-500 text-xs">
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
                      <InputGroupInput
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Last Name"
                      />
                    </InputGroup>
                    {field.state.meta.errors && (
                      <p className="text-red-500 text-xs">
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
                      <p className="text-red-500 text-xs">
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
                      <p className="text-red-500 text-xs">
                        {formatValidationErrors(field.state.meta.errors)}
                      </p>
                    )}
                  </Field>
                )}
              </form.Field>

              {/* Read-only Email */}
              <Field>
                <FieldLabel>Email</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Mail className="size-4 text-muted-foreground/60" />
                  </InputGroupAddon>
                  <InputGroupInput value={user.email} disabled />
                </InputGroup>
              </Field>

              {/* Read-only NIC */}
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

            {/* Professional non-editable info */}
            <div className="grid grid-cols-4 gap-4 mt-6 text-sm text-muted-foreground">
              <div className="flex flex-col p-3 bg-muted/10 rounded-md shadow-sm">
                <span className="font-medium">Role</span>
                <span className="text-foreground">{user.roleName}</span>
              </div>
              <div className="flex flex-col p-3 bg-muted/10 rounded-md shadow-sm">
                <span className="font-medium">Status</span>
                <span className="text-foreground">
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex flex-col p-3 bg-muted/10 rounded-md shadow-sm">
                <span className="font-medium">Created At</span>
                <span className="text-foreground">
                  {new Date(user.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col p-3 bg-muted/10 rounded-md shadow-sm">
                <span className="font-medium">Updated At</span>
                <span className="text-foreground">
                  {new Date(user.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-2">
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
          <p className="text-sm text-muted-foreground p-4">User not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
