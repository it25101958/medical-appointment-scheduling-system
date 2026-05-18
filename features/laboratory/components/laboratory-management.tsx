"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Edit3, Eye, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Badge,
  Button,
  DataTable,
  type Column,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { highlightText } from "@/lib/highlight-search";
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
import { getErrorMessage } from "@/lib/utils";
import { CrudActionButton } from "@/features/shared/components/crud-action-button";
import { CrudPageHeader } from "@/features/shared/components/crud-page-header";
import { DeleteConfirmDialog } from "@/features/shared/components/delete-confirm-dialog";
import { SearchBar } from "@/components/ui";

function createEmptyForm(): LaboratoryPayload {
  return {
    name: "",
    address: "",
    openingHours: "",
    phone: "",
    email: "",
  };
}

function normalize(value: string) {
  return value.trim().toLowerCase();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLaboratory, setSelectedLaboratory] =
    useState<Laboratory | null>(null);
  const [formValues, setFormValues] =
    useState<LaboratoryPayload>(createEmptyForm());

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredLaboratories = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return laboratories;
    return laboratories.filter((laboratory) => {
      const haystack = [
        laboratory.laboratoryId?.toString(),
        laboratory.name,
        laboratory.address,
        laboratory.openingHours,
        laboratory.phone,
        laboratory.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [deferredSearchQuery, laboratories]);

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

  const columns: Column<Laboratory>[] = useMemo(
    () => [
      {
        header: "ID",
        render: (laboratory) =>
          highlightText(
            laboratory.laboratoryId?.toString() || "",
            deferredSearchQuery,
          ),
        className: "w-[100px] px-5 py-4 font-semibold text-foreground",
      },
      {
        header: "Name",
        render: (laboratory) =>
          highlightText(laboratory.name || "", deferredSearchQuery),
        className: "w-[220px] px-5 py-4 font-medium text-foreground",
      },
      {
        header: "Address",
        render: (laboratory) => (
          <div className="max-w-[320px] whitespace-normal text-sm text-muted-foreground">
            {highlightText(laboratory.address || "", deferredSearchQuery)}
          </div>
        ),
        className: "px-5 py-4 align-top",
      },
      {
        header: "Opening Hours",
        render: (laboratory) =>
          highlightText(laboratory.openingHours || "", deferredSearchQuery),
        className: "w-[200px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Phone",
        render: (laboratory) =>
          highlightText(laboratory.phone || "", deferredSearchQuery),
        className: "w-[180px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Email",
        render: (laboratory) =>
          highlightText(laboratory.email || "", deferredSearchQuery),
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
            <CrudActionButton
              label="View laboratory"
              icon={<Eye className="size-4" />}
              onClick={() => openDetailsDialog(laboratory)}
            />

            {canManage && (
              <>
                <CrudActionButton
                  label="Edit laboratory"
                  icon={<Edit3 className="size-4" />}
                  onClick={() => openEditDialog(laboratory)}
                />

                <CrudActionButton
                  label="Delete laboratory"
                  icon={<Trash2 className="size-4" />}
                  destructive
                  onClick={() => openDeleteDialog(laboratory)}
                />
              </>
            )}
          </div>
        ),
        className: "w-[180px] px-5 py-4 text-center",
      },
    ],
    [canManage, deferredSearchQuery],
  );

  return (
    <div className="space-y-6 col-start-1 col-end-14">
      <CrudPageHeader
        title={title}
        description={description}
        onRefresh={fetchLaboratories}
        createAction={
          canManage
            ? {
                label: "New Laboratory",
                icon: <Plus className="h-4 w-4" />,
                onClick: openCreateDialog,
              }
            : undefined
        }
      />

      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, address, phone, or email"
          resultCount={filteredLaboratories.length}
        />
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
            data={filteredLaboratories}
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

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Laboratory"
        message="Are you sure you want to delete this laboratory? This action cannot be undone."
        deleting={deleting}
        onCancel={() => {
          setDeleteOpen(false);
          setSelectedLaboratory(null);
        }}
        onConfirm={handleDelete}
        confirmLabel="Delete Laboratory"
      />
    </div>
  );
}
