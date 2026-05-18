"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
} from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CrudActionButton } from "@/features/shared/components/crud-action-button";
import { PageHeader } from "@/components/ui/page-header";
import { SearchBar } from "@/components/ui/search-bar";
import { RefreshCcw } from "lucide-react";
import { DeleteConfirmDialog } from "@/features/shared/components/delete-confirm-dialog";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import {
  deleteMedication,
  getMedications,
  createMedication,
  updateMedication,
  type Medication,
  type MedicationPayload,
} from "@/lib/services/medication-service";
import { getErrorMessage } from "@/lib/utils";
import { Edit3, Pill, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { highlightText } from "@/lib/highlight-search";
import { Label } from "@/components/ui";

const MEDICATION_STATUS_OPTIONS = [
  "AVAILABLE",
  "NOT_AVAILABLE",
  "DISCONTINUED",
] as const;

function createEmptyForm(): MedicationPayload {
  return {
    name: "",
    genericName: "",
    manufacturer: "",
    dosage: "",
    dosageForm: "",
    status: "AVAILABLE",
  };
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function getStatusBadgeClasses(status: string) {
  const normalized = normalize(status);

  if (
    ["active", "available", "in stock", "in-stock"].some((item) =>
      normalized.includes(item),
    )
  ) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (["low", "limited"].some((item) => normalized.includes(item))) {
    return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (
    ["out", "discontinued", "inactive", "expired"].some((item) =>
      normalized.includes(item),
    )
  ) {
    return "border-destructive/20 bg-destructive/10 text-destructive";
  }

  return "border-border bg-muted/40 text-muted-foreground";
}

export default function AdminMedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [formValues, setFormValues] =
    useState<MedicationPayload>(createEmptyForm());

  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    fetchMedications();
  }, []);

  async function fetchMedications() {
    setLoading(true);
    try {
      const data = await getMedications();
      setMedications(
        (data || [])
          .slice()
          .sort((left, right) => right.medicationId - left.medicationId),
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setSelectedMedication(null);
    setFormValues(createEmptyForm());
    setDialogOpen(true);
  }

  function openEditDialog(medication: Medication) {
    setSelectedMedication(medication);
    setFormValues({
      name: medication.name || "",
      genericName: medication.genericName || "",
      manufacturer: medication.manufacturer || "",
      dosage: medication.dosage || "",
      dosageForm: medication.dosageForm || "",
      status: medication.status || "",
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(medication: Medication) {
    setSelectedMedication(medication);
    setDeleteOpen(true);
  }

  async function handleSave() {
    if (!formValues.name.trim()) {
      toast.error("Medication name is required.");
      return;
    }

    if (!formValues.genericName.trim()) {
      toast.error("Generic name is required.");
      return;
    }

    if (!formValues.manufacturer.trim()) {
      toast.error("Manufacturer is required.");
      return;
    }

    if (!formValues.dosage.trim()) {
      toast.error("Dosage is required.");
      return;
    }

    if (!formValues.dosageForm.trim()) {
      toast.error("Dosage form is required.");
      return;
    }

    if (!formValues.status.trim()) {
      toast.error("Status is required.");
      return;
    }

    setSaving(true);
    try {
      if (selectedMedication) {
        await updateMedication(selectedMedication.medicationId, formValues);
        toast.success("Medication updated successfully.");
      } else {
        await createMedication(formValues);
        toast.success("Medication created successfully.");
      }

      setDialogOpen(false);
      setSelectedMedication(null);
      setFormValues(createEmptyForm());
      await fetchMedications();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedMedication) return;

    setDeleting(true);
    try {
      await deleteMedication(selectedMedication.medicationId);
      toast.success("Medication removed successfully.");
      setDeleteOpen(false);
      setSelectedMedication(null);
      await fetchMedications();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  const filteredMedications = useMemo(() => {
    const query = normalize(deferredSearchQuery);

    if (!query) {
      return medications;
    }

    return medications.filter((medication) => {
      const haystack = [
        medication.name,
        medication.genericName,
        medication.manufacturer,
        medication.dosage,
        medication.dosageForm,
        medication.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [deferredSearchQuery, medications]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMedications.length / pageSize),
  );

  const paginatedMedications = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredMedications.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredMedications, pageSize]);

  useEffect(() => {
    setCurrentPage(0);
  }, [deferredSearchQuery, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(totalPages - 1);
    }
  }, [currentPage, totalPages]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Total medications",
        value: medications.length,
        note: "Fetched through a tag-backed cache",
      },
      {
        title: "Visible rows",
        value: filteredMedications.length,
        note: "Updates instantly as you search",
      },
      {
        title: "Manufacturers",
        value: new Set(
          medications
            .map((medication) => medication.manufacturer.trim().toLowerCase())
            .filter(Boolean),
        ).size,
        note: "Unique manufacturers in inventory",
      },
    ],
    [filteredMedications.length, medications],
  );

  return (
    <div className="col-start-1 col-end-14">
      <PageHeader
        title="Medication Inventory"
        description="Create, update, search, and remove medication records with cache-backed refreshes and fast local filtering."
        actions={
          <>
            <Button onClick={fetchMedications} size="sm" variant="outline">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={openCreateDialog}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Medication
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {summaryCards.map((card) => (
          <Card
            key={card.title}
            className="border-border/60 bg-card/80 backdrop-blur"
          >
            <CardHeader className="space-y-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className="text-3xl font-semibold tracking-tight text-foreground">
                {card.value}
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {card.note}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, generic name, dosage, form, manufacturer, or status"
          resultCount={filteredMedications.length}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Loading medications...
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            No medications match your search.
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[620px] w-full">
              <Table className="min-w-[1180px]">
                <TableHeader>
                  <TableRow className="bg-muted/45 hover:bg-muted/45">
                    <TableHead className="w-[90px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      ID
                    </TableHead>
                    <TableHead className="w-[200px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="w-[200px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Generic
                    </TableHead>
                    <TableHead className="w-[200px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Manufacturer
                    </TableHead>
                    <TableHead className="w-[150px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Dosage
                    </TableHead>
                    <TableHead className="w-[150px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Form
                    </TableHead>
                    <TableHead className="w-[160px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="w-[180px] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Updated
                    </TableHead>
                    <TableHead className="w-[150px] px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedMedications.map((medication) => (
                    <TableRow
                      key={medication.medicationId}
                      className="group transition-colors hover:bg-muted/25"
                    >
                      <TableCell className="w-[90px] px-5 py-4 font-semibold text-foreground">
                        {medication.medicationId}
                      </TableCell>
                      <TableCell className="w-[200px] px-5 py-4 font-medium text-foreground">
                        {highlightText(medication.name, deferredSearchQuery)}
                      </TableCell>
                      <TableCell className="w-[200px] px-5 py-4 text-muted-foreground">
                        {highlightText(
                          medication.genericName,
                          deferredSearchQuery,
                        )}
                      </TableCell>
                      <TableCell className="w-[200px] px-5 py-4 text-muted-foreground">
                        {highlightText(
                          medication.manufacturer,
                          deferredSearchQuery,
                        )}
                      </TableCell>
                      <TableCell className="w-[150px] px-5 py-4 text-muted-foreground">
                        {highlightText(medication.dosage, deferredSearchQuery)}
                      </TableCell>
                      <TableCell className="w-[150px] px-5 py-4 text-muted-foreground">
                        {highlightText(
                          medication.dosageForm,
                          deferredSearchQuery,
                        )}
                      </TableCell>
                      <TableCell className="w-[160px] px-5 py-4">
                        <Badge
                          variant="outline"
                          className={`rounded-full px-3 py-0.5 uppercase tracking-wide ${getStatusBadgeClasses(medication.status)}`}
                        >
                          {medication.status || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[180px] px-5 py-4 text-sm text-muted-foreground">
                        {formatDate(
                          medication.updatedAt || medication.createdAt,
                        )}
                      </TableCell>
                      <TableCell className="w-[150px] px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <CrudActionButton
                            label="Edit medication"
                            icon={<Edit3 className="size-4" />}
                            onClick={() => openEditDialog(medication)}
                          />
                          <CrudActionButton
                            label="Delete medication"
                            icon={<Trash2 className="size-4" />}
                            destructive
                            onClick={() => openDeleteDialog(medication)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={[5, 8, 10, 20]}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(0);
              }}
            />
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[760px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Pill className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    {selectedMedication ? "Edit Medication" : "Create Medication"}
                  </DialogTitle>
                  <DialogDescription>
                    Maintain medication inventory details and availability.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 px-6 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-1">
              <Label className="form-label mb-0" htmlFor="medication-name">
                Medication Name
              </Label>
              <Input
                id="medication-name"
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g., Paracetamol"
              />
            </div>

            <div className="grid gap-2 sm:col-span-1">
              <Label
                className="form-label mb-0"
                htmlFor="medication-generic-name"
              >
                Generic Name
              </Label>
              <Input
                id="medication-generic-name"
                value={formValues.genericName}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    genericName: event.target.value,
                  }))
                }
                placeholder="e.g., Acetaminophen"
              />
            </div>

            <div className="grid gap-2 sm:col-span-1">
              <Label
                className="form-label mb-0"
                htmlFor="medication-manufacturer"
              >
                Manufacturer
              </Label>
              <Input
                id="medication-manufacturer"
                value={formValues.manufacturer}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    manufacturer: event.target.value,
                  }))
                }
                placeholder="e.g., Acme Pharma"
              />
            </div>

            <div className="grid gap-2 sm:col-span-1">
              <Label className="form-label mb-0" htmlFor="medication-dosage">
                Dosage
              </Label>
              <Input
                id="medication-dosage"
                value={formValues.dosage}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    dosage: event.target.value,
                  }))
                }
                placeholder="e.g., 500 mg"
              />
            </div>

            <div className="grid gap-2 sm:col-span-1">
              <Label
                className="form-label mb-0"
                htmlFor="medication-dosage-form"
              >
                Dosage Form
              </Label>
              <Input
                id="medication-dosage-form"
                value={formValues.dosageForm}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    dosageForm: event.target.value,
                  }))
                }
                placeholder="e.g., Tablet"
              />
            </div>

            <div className="grid gap-2 sm:col-span-1">
              <Label className="form-label mb-0" htmlFor="medication-status">
                Status
              </Label>
              <Select
                value={formValues.status}
                onValueChange={(value) =>
                  setFormValues((current) => ({
                    ...current,
                    status: value,
                  }))
                }
              >
                <SelectTrigger id="medication-status">
                  <SelectValue placeholder="Select medication status" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                >
                  {MEDICATION_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedMedication(null);
                setFormValues(createEmptyForm());
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? "Saving..."
                : selectedMedication
                  ? "Update Medication"
                  : "Create Medication"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Medication"
        message="Are you sure you want to delete this medication? This action cannot be undone."
        deleting={deleting}
        onCancel={() => {
          setDeleteOpen(false);
          setSelectedMedication(null);
        }}
        onConfirm={handleDelete}
        confirmLabel="Delete Medication"
      />
    </div>
  );
}
