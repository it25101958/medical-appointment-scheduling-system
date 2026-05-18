"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Edit3,
  Eye,
  FilePlus,
  FlaskConical,
  Hash,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  PageHeader,
} from "@/components/ui";
import { getErrorMessage } from "@/lib/utils";
import { labResultApi } from "../api/lab-result.api";
import {
  labResultSchema,
  type LabResultValues,
} from "../schemas/lab-result.schema";
import { LabResultResponse } from "../types/lab-result.types";

const statusOptions = ["PENDING", "IN_PROGRESS", "COMPLETED"];

function createEmptyForm(): LabResultValues {
  return {
    appointmentId: 0,
    patientId: 0,
    testName: "",
    resultValue: "",
    referenceRange: "",
    status: "PENDING",
    remarks: "",
    testDate: new Date().toISOString().split("T")[0],
  };
}

function getStatusClasses(status: string) {
  const normalized = status.toUpperCase();

  if (normalized === "COMPLETED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "IN_PROGRESS") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function allRequiredFieldsSet(values: LabResultValues) {
  return (
    Number(values.appointmentId) > 0 &&
    Number(values.patientId) > 0 &&
    values.testName.trim().length > 0 &&
    values.resultValue.trim().length > 0 &&
    values.referenceRange.trim().length > 0 &&
    values.status.trim().length > 0
  );
}

interface LabResultManagementProps {
  title?: string;
  description?: string;
  canManage?: boolean;
}

export function LabResultManagement({
  title = "Lab Results",
  description = "Create and update patient lab results by appointment and test.",
  canManage = true,
}: LabResultManagementProps) {
  const [results, setResults] = useState<LabResultResponse[]>([]);
  const [patientIdFilter, setPatientIdFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedResult, setSelectedResult] =
    useState<LabResultResponse | null>(null);
  const [formValues, setFormValues] =
    useState<LabResultValues>(createEmptyForm());

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => b.id - a.id);
  }, [results]);

  async function searchByPatient() {
    if (!patientIdFilter.trim()) {
      toast.error("Patient ID is required.");
      return;
    }

    setLoading(true);
    try {
      const data = await labResultApi.getByPatient(Number(patientIdFilter));
      setResults(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load lab results"));
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setSelectedResult(null);
    setFormValues({
      ...createEmptyForm(),
      patientId: patientIdFilter ? Number(patientIdFilter) : 0,
    });
    setDialogOpen(true);
  }

  function openEditDialog(result: LabResultResponse) {
    setSelectedResult(result);
    setFormValues({
      appointmentId: result.appointmentId,
      patientId: result.patientId,
      testName: result.testName || "",
      resultValue: result.resultValue || "",
      referenceRange: result.referenceRange || "",
      status: result.status || "PENDING",
      remarks: result.remarks || "",
      testDate: new Date().toISOString().split("T")[0],
    });
    setDialogOpen(true);
  }

  function openDetailsDialog(result: LabResultResponse) {
    setSelectedResult(result);
    setDetailsOpen(true);
  }

  async function saveResult() {
    const parsed = labResultSchema.safeParse({
      ...formValues,
      remarks: formValues.remarks?.trim() || undefined,
      testDate: formValues.testDate || undefined,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Check lab result fields");
      return;
    }

    setSaving(true);
    try {
      if (selectedResult) {
        await labResultApi.update(selectedResult.id, parsed.data);
        toast.success("Lab result updated successfully.");
      } else {
        await labResultApi.create(parsed.data);
        toast.success("Lab result created successfully.");
      }

      setDialogOpen(false);
      setSelectedResult(null);
      setFormValues(createEmptyForm());

      if (patientIdFilter.trim()) {
        const data = await labResultApi.getByPatient(Number(patientIdFilter));
        setResults(data || []);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save lab result"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="col-start-1 col-end-14 space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          canManage ? (
            <Button size="sm" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              New Result
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Search className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">
              Search patient results
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter a patient ID to load lab results from
              <span className="font-medium"> /lab-results/patient/:id</span>.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[220px_auto] md:items-end">
          <div className="grid gap-2">
            <Label className="form-label mb-0" htmlFor="patient-search">
              Patient ID
            </Label>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="patient-search"
              type="number"
              min={1}
              className="pl-9"
              value={patientIdFilter}
              onChange={(event) => setPatientIdFilter(event.target.value)}
              placeholder="Enter patient ID"
            />
            </div>
          </div>
          {patientIdFilter.trim() && (
            <Button onClick={searchByPatient} disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Searching..." : "Search"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              Loading lab results...
          </div>
        ) : sortedResults.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              Search by patient ID to view lab results.
          </div>
        ) : (
          sortedResults.map((result) => (
            <div
              key={result.id}
              className="rounded-lg border border-border bg-card p-5"
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        {result.testName}
                      </h2>
                      <Badge variant="outline">Result #{result.id}</Badge>
                      <Badge
                        variant="outline"
                        className={getStatusClasses(result.status)}
                      >
                        {result.status}
                      </Badge>
                    </div>
                    <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                      <span>Appointment #{result.appointmentId}</span>
                      <span>Patient #{result.patientId}</span>
                      <span>
                        Updated{" "}
                        {result.updatedAt
                          ? new Date(result.updatedAt).toLocaleDateString()
                          : "not available"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => openDetailsDialog(result)}
                      aria-label="View lab result"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canManage && (
                      <>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          onClick={() => openEditDialog(result)}
                          aria-label="Edit lab result"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          disabled
                          title="The backend does not expose DELETE /lab-results/{id}."
                          aria-label="Delete unavailable"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[820px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FlaskConical className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    {selectedResult ? "Edit Lab Result" : "Create Lab Result"}
                  </DialogTitle>
                  <DialogDescription>
                    Record patient lab result values for an appointment.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-sm font-medium leading-none">
                Lab Result Details
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your backend supports create, patient lookup, detail lookup, and
                update. Delete is not available.
              </p>
            </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="appointment-id">
                Appointment ID *
              </Label>
              <Input
                id="appointment-id"
                type="number"
                min={1}
                value={formValues.appointmentId || ""}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    appointmentId: Number(event.target.value),
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="patient-id">
                Patient ID *
              </Label>
              <Input
                id="patient-id"
                type="number"
                min={1}
                value={formValues.patientId || ""}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    patientId: Number(event.target.value),
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0">Status *</Label>
              <Select
                value={formValues.status}
                onValueChange={(value) =>
                  setFormValues((current) => ({ ...current, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                >
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="test-name">
                Test Name *
              </Label>
              <Input
                id="test-name"
                value={formValues.testName}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    testName: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="test-date">
                Test Date
              </Label>
              <Input
                id="test-date"
                type="date"
                value={formValues.testDate || ""}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    testDate: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="result-value">
                Result Value *
              </Label>
              <Input
                id="result-value"
                value={formValues.resultValue}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    resultValue: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="reference-range">
                Reference Range *
              </Label>
              <Input
                id="reference-range"
                value={formValues.referenceRange}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    referenceRange: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label className="form-label mb-0" htmlFor="remarks">
                Remarks
              </Label>
              <Textarea
                id="remarks"
                value={formValues.remarks || ""}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    remarks: event.target.value,
                  }))
                }
                rows={4}
              />
            </div>
          </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedResult(null);
                setFormValues(createEmptyForm());
              }}
            >
              Cancel
            </Button>
            {allRequiredFieldsSet(formValues) && (
              <Button onClick={saveResult} disabled={saving}>
                <FilePlus className="mr-2 h-4 w-4" />
                {saving
                  ? "Saving..."
                  : selectedResult
                    ? "Update Result"
                    : "Create Result"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[720px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Eye className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Lab Result Details
                  </DialogTitle>
                  <DialogDescription>
                    Review patient lab result information.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-4 px-6 pb-6">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {selectedResult.testName}
                  </h3>
                  <Badge
                    variant="outline"
                    className={getStatusClasses(selectedResult.status)}
                  >
                    {selectedResult.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Result: {selectedResult.resultValue}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="font-medium">{selectedResult.referenceRange}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Appointment</p>
                  <p className="font-medium">
                    #{selectedResult.appointmentId}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium">#{selectedResult.patientId}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="font-medium">
                    {selectedResult.updatedAt
                      ? new Date(selectedResult.updatedAt).toLocaleString()
                      : "Not available"}
                  </p>
                </div>
              </div>

              {selectedResult.remarks && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">Remarks</p>
                  <p className="text-sm">{selectedResult.remarks}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
