"use client";

import { useEffect, useState } from "react";
import { Edit3, Eye, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, DataTable, type Column } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createLaboratory,
  deleteLaboratory,
  getLaboratories,
  updateLaboratory,
  type Laboratory,
  type LaboratoryPayload,
} from "@/lib/services/laboratory-service";

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function createEmptyForm(): LaboratoryPayload {
  return {
    name: "",
    address: "",
    openingHours: "",
    phone: "",
    email: "",
  };
}

interface LaboratoryManagementProps {
  title: string;
  description: string;
  canManage?: boolean;
}

export function LaboratoryManagement({
  title,
  description,
  canManage = true,
}: LaboratoryManagementProps) {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLaboratory, setSelectedLaboratory] =
    useState<Laboratory | null>(null);
  const [formValues, setFormValues] =
    useState<LaboratoryPayload>(createEmptyForm());

  useEffect(() => {
    fetchLaboratories();
  }, []);

  async function fetchLaboratories() {
    setLoading(true);
    try {
      const data = await getLaboratories();
      setLaboratories(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setSelectedLaboratory(null);
    setFormValues(createEmptyForm());
    setDialogOpen(true);
  }

  function openEditDialog(laboratory: Laboratory) {
    setSelectedLaboratory(laboratory);
    setFormValues({
      name: laboratory.name || "",
      address: laboratory.address || "",
      openingHours: laboratory.openingHours || "",
      phone: laboratory.phone || "",
      email: laboratory.email || "",
    });
    setDialogOpen(true);
  }

  function openDetailsDialog(laboratory: Laboratory) {
    setSelectedLaboratory(laboratory);
    setDetailsOpen(true);
  }

  function openDeleteDialog(laboratory: Laboratory) {
    setSelectedLaboratory(laboratory);
    setDeleteOpen(true);
  }

  async function handleSave() {
    if (!formValues.name.trim()) {
      toast.error("Laboratory name is required.");
      return;
    }

    if (!formValues.address.trim()) {
      toast.error("Address is required.");
      return;
    }

    if (!formValues.openingHours.trim()) {
      toast.error("Opening hours are required.");
      return;
    }

    if (!formValues.phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }

    if (!formValues.email.trim()) {
      toast.error("Email is required.");
      return;
    }

    setSaving(true);
    try {
      if (selectedLaboratory) {
        await updateLaboratory(selectedLaboratory.laboratoryId, formValues);
        toast.success("Laboratory updated successfully.");
      } else {
        await createLaboratory(formValues);
        toast.success("Laboratory created successfully.");
      }

      setDialogOpen(false);
      setSelectedLaboratory(null);
      setFormValues(createEmptyForm());
      await fetchLaboratories();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedLaboratory) return;

    setDeleting(true);
    try {
      await deleteLaboratory(selectedLaboratory.laboratoryId);
      toast.success("Laboratory removed successfully.");
      setDeleteOpen(false);
      setSelectedLaboratory(null);
      await fetchLaboratories();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<Laboratory>[] = [
    {
      header: "ID",
      accessor: "laboratoryId",
      className: "w-[100px] px-5 py-4 font-semibold text-foreground",
    },
    {
      header: "Name",
      accessor: "name",
      className: "w-[220px] px-5 py-4 font-medium text-foreground",
    },
    {
      header: "Address",
      render: (laboratory) => (
        <div className="max-w-[320px] whitespace-normal text-sm text-muted-foreground">
          {laboratory.address}
        </div>
      ),
      className: "px-5 py-4 align-top",
    },
    {
      header: "Opening Hours",
      accessor: "openingHours",
      className: "w-[200px] px-5 py-4 text-muted-foreground",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "w-[180px] px-5 py-4 text-muted-foreground",
    },
    {
      header: "Email",
      accessor: "email",
      className: "w-[240px] px-5 py-4 text-muted-foreground",
    },
    {
      header: "Updated",
      render: (laboratory) => (
        <span className="text-sm text-muted-foreground">
          {laboratory.updatedAt
            ? new Date(laboratory.updatedAt).toLocaleDateString()
            : laboratory.createdAt
              ? new Date(laboratory.createdAt).toLocaleDateString()
              : "—"}
        </span>
      ),
      className: "w-[140px] px-5 py-4",
    },
    {
      header: "Actions",
      render: (laboratory) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => openDetailsDialog(laboratory)}
          >
            <Eye className="size-4" />
            <span className="sr-only">View laboratory</span>
          </Button>

          {canManage && (
            <>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => openEditDialog(laboratory)}
              >
                <Edit3 className="size-4" />
                <span className="sr-only">Edit laboratory</span>
              </Button>

              <Button
                size="icon-sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => openDeleteDialog(laboratory)}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Delete laboratory</span>
              </Button>
            </>
          )}
        </div>
      ),
      className: "w-[180px] px-5 py-4 text-center",
    },
  ];

  return (
    <div className="space-y-6 col-start-1 col-end-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={fetchLaboratories} size="sm" variant="outline">
            <RefreshCcw className="h-4 w-4" />
          </Button>

          {canManage && (
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4" /> New Laboratory
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 shadow-sm">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Loading laboratories...
          </div>
        ) : laboratories.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            No laboratories found.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={laboratories}
            pageable={true}
            pageSize={10}
            showActions={false}
            emptyMessage="No laboratories found."
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedLaboratory ? "Edit Laboratory" : "Create Laboratory"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor="laboratory-name">Laboratory Name</Label>
              <Input
                id="laboratory-name"
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g., Central Diagnostics Lab"
              />
            </div>

            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor="laboratory-phone">Phone</Label>
              <Input
                id="laboratory-phone"
                value={formValues.phone}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="e.g., +94 77 123 4567"
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="laboratory-address">Address</Label>
              <Textarea
                id="laboratory-address"
                value={formValues.address}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                placeholder="Enter the full laboratory address"
                rows={3}
              />
            </div>

            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor="laboratory-opening-hours">Opening Hours</Label>
              <Input
                id="laboratory-opening-hours"
                value={formValues.openingHours}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    openingHours: event.target.value,
                  }))
                }
                placeholder="e.g., Mon-Fri 08:00 - 17:00"
              />
            </div>

            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor="laboratory-email">Email</Label>
              <Input
                id="laboratory-email"
                type="email"
                value={formValues.email}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="lab@example.com"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedLaboratory(null);
                setFormValues(createEmptyForm());
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? "Saving..."
                : selectedLaboratory
                  ? "Update Laboratory"
                  : "Create Laboratory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Laboratory Details
            </DialogTitle>
          </DialogHeader>

          {selectedLaboratory && (
            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 sm:col-span-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedLaboratory.name}
                  </h3>
                  <Badge variant="outline" className="rounded-full px-3 py-0.5">
                    ID #{selectedLaboratory.laboratoryId}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedLaboratory.address}
                </p>
              </div>

              <div className="space-y-1 rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Opening Hours
                </p>
                <p className="text-sm font-medium text-foreground">
                  {selectedLaboratory.openingHours}
                </p>
              </div>

              <div className="space-y-1 rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>
                <p className="text-sm font-medium text-foreground">
                  {selectedLaboratory.phone}
                </p>
              </div>

              <div className="space-y-1 rounded-2xl border border-border/60 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="text-sm font-medium text-foreground">
                  {selectedLaboratory.email}
                </p>
              </div>

              <div className="space-y-1 rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Created
                </p>
                <p className="text-sm font-medium text-foreground">
                  {selectedLaboratory.createdAt
                    ? new Date(selectedLaboratory.createdAt).toLocaleString()
                    : "—"}
                </p>
              </div>

              <div className="space-y-1 rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Updated
                </p>
                <p className="text-sm font-medium text-foreground">
                  {selectedLaboratory.updatedAt
                    ? new Date(selectedLaboratory.updatedAt).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Delete Laboratory
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this laboratory? This action cannot
            be undone.
          </p>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setSelectedLaboratory(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Laboratory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
