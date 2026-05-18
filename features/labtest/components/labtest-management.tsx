"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeDollarSign,
  Edit3,
  Eye,
  FlaskConical,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Badge,
  Button,
  DataTable,
  type Column,
  PageHeader,
  SearchBar,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { highlightText } from "@/lib/highlight-search";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createLabTest,
  deleteLabTest,
  getActiveLabTests,
  getAllLabTests,
  getInactiveLabTests,
  updateLabTest,
  type LabTest,
  type LabTestPayload,
} from "@/lib/services/labtest-service";
import { getErrorMessage } from "@/lib/utils";
import { CrudActionButton } from "@/features/shared/components/crud-action-button";

type LabTestFilter = "all" | "active" | "inactive";

function createEmptyForm(): LabTestPayload {
  return {
    testName: "",
    category: "",
    description: "",
    standardPrice: 0,
    isActive: true,
  };
}

function getStatusBadgeClasses(isActive: boolean) {
  return isActive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-50 text-slate-700";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

interface LabTestManagementProps {
  title: string;
  description: string;
  canManage?: boolean;
  defaultFilter?: LabTestFilter;
}

export function LabTestManagement({
  title,
  description,
  canManage = true,
  defaultFilter = "all",
}: LabTestManagementProps) {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<LabTestFilter>(defaultFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const [formValues, setFormValues] =
    useState<LabTestPayload>(createEmptyForm());

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredLabTests = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return labTests;
    return labTests.filter((labTest) => {
      const haystack = [
        labTest.id?.toString(),
        labTest.testName,
        labTest.category,
        labTest.description,
        labTest.standardPrice?.toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [deferredSearchQuery, labTests]);

  useEffect(() => {
    fetchLabTests(filter);
  }, [filter]);

  async function fetchLabTests(nextFilter: LabTestFilter = filter) {
    setLoading(true);
    try {
      const data =
        nextFilter === "active"
          ? await getActiveLabTests()
          : nextFilter === "inactive"
            ? await getInactiveLabTests()
            : await getAllLabTests();

      setLabTests(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setSelectedLabTest(null);
    setFormValues(createEmptyForm());
    setDialogOpen(true);
  }

  function openEditDialog(labTest: LabTest) {
    setSelectedLabTest(labTest);
    setFormValues({
      testName: labTest.testName || "",
      category: labTest.category || "",
      description: labTest.description || "",
      standardPrice:
        typeof labTest.standardPrice === "number"
          ? labTest.standardPrice
          : Number(labTest.standardPrice) || 0,
      isActive: Boolean(labTest.isActive),
    });
    setDialogOpen(true);
  }

  function openDetailsDialog(labTest: LabTest) {
    setSelectedLabTest(labTest);
    setDetailsOpen(true);
  }

  function openDeleteDialog(labTest: LabTest) {
    setSelectedLabTest(labTest);
    setDeleteOpen(true);
  }

  async function handleSave() {
    if (!formValues.testName.trim()) {
      toast.error("Test name is required.");
      return;
    }

    if (!formValues.category.trim()) {
      toast.error("Category is required.");
      return;
    }

    if (!formValues.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    if (
      !Number.isFinite(formValues.standardPrice) ||
      formValues.standardPrice <= 0
    ) {
      toast.error("Standard price must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      if (selectedLabTest) {
        await updateLabTest(selectedLabTest.id, formValues);
        toast.success("Lab test updated successfully.");
      } else {
        await createLabTest(formValues);
        toast.success("Lab test created successfully.");
      }

      setDialogOpen(false);
      setSelectedLabTest(null);
      setFormValues(createEmptyForm());
      await fetchLabTests();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedLabTest) return;

    setDeleting(true);
    try {
      await deleteLabTest(selectedLabTest.id);
      toast.success("Lab test removed successfully.");
      setDeleteOpen(false);
      setSelectedLabTest(null);
      await fetchLabTests();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<LabTest>[] = useMemo(
    () => [
      {
        header: "ID",
        render: (labTest) =>
          highlightText(labTest.id?.toString() || "", deferredSearchQuery),
        className: "w-[90px] px-5 py-4 font-semibold text-foreground",
      },
      {
        header: "Test Name",
        render: (labTest) =>
          highlightText(labTest.testName || "", deferredSearchQuery),
        className: "w-[220px] px-5 py-4 font-medium text-foreground",
      },
      {
        header: "Category",
        render: (labTest) =>
          highlightText(labTest.category || "", deferredSearchQuery),
        className: "w-[180px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Description",
        render: (labTest) => (
          <div className="max-w-[520px] whitespace-normal text-sm text-muted-foreground">
            {highlightText(labTest.description || "", deferredSearchQuery)}
          </div>
        ),
        className: "w-[460px] px-5 py-4 align-top",
      },
      {
        header: "Price",
        render: (labTest) => (
          <span className="font-medium text-foreground">
            LKR {Number(labTest.standardPrice).toLocaleString()}
          </span>
        ),
        className: "w-[150px] px-5 py-4",
      },
      {
        header: "Status",
        render: (labTest) => (
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-0.5 text-[11px] font-medium ${getStatusBadgeClasses(
              Boolean(labTest.isActive),
            )}`}
          >
            {labTest.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
        className: "w-[120px] px-5 py-4",
      },
      {
        header: "Updated",
        render: (labTest) => (
          <span className="text-sm text-muted-foreground">
            {labTest.updatedAt
              ? new Date(labTest.updatedAt).toLocaleDateString()
              : labTest.createdAt
                ? new Date(labTest.createdAt).toLocaleDateString()
                : "—"}
          </span>
        ),
        className: "w-[140px] px-5 py-4",
      },
      {
        header: "Actions",
        render: (labTest) => (
          <div className="flex items-center justify-center gap-2">
            <CrudActionButton
              label="View lab test"
              icon={<Eye className="size-4" />}
              onClick={() => openDetailsDialog(labTest)}
            />

            {canManage && (
              <>
                <CrudActionButton
                  label="Edit lab test"
                  icon={<Edit3 className="size-4" />}
                  onClick={() => openEditDialog(labTest)}
                />

                <CrudActionButton
                  label="Delete lab test"
                  icon={<Trash2 className="size-4" />}
                  destructive
                  onClick={() => openDeleteDialog(labTest)}
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

  const filterButtons: Array<{ value: LabTestFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="space-y-6 col-start-1 col-end-14">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button
              onClick={() => fetchLabTests(filter)}
              size="sm"
              variant="outline"
              aria-label="Refresh lab tests"
              title="Refresh"
            >
              <Activity className="h-4 w-4" />
            </Button>
            {canManage && (
              <Button onClick={openCreateDialog} size="sm">
                <Plus className="h-4 w-4" />
                New Lab Test
              </Button>
            )}
          </>
        }
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name, category, description, or price"
        resultCount={filteredLabTests.length}
      />

      <div className="flex flex-wrap gap-2">
        {filterButtons.map((button) => (
          <Button
            key={button.value}
            size="sm"
            variant={filter === button.value ? "default" : "outline"}
            onClick={() => setFilter(button.value)}
          >
            {button.label}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Loading lab tests...
          </div>
        ) : labTests.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            No lab tests found.
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredLabTests}
            pageable={true}
            pageSize={10}
            showActions={false}
            emptyMessage="No lab tests found."
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[720px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FlaskConical className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    {selectedLabTest ? "Edit Lab Test" : "Create Lab Test"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure the lab test details, pricing, and availability.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-primary ring-1 ring-border/70">
                  <FlaskConical className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    Lab Test Details
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use clear names and categories so doctors can find tests
                    quickly.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-1">
              <Label className="form-label mb-0" htmlFor="labtest-name">
                Test Name
              </Label>
              <div className="relative">
                <FlaskConical className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="labtest-name"
                className="pl-9"
                value={formValues.testName}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    testName: event.target.value,
                  }))
                }
                placeholder="e.g., Complete Blood Count"
              />
              </div>
            </div>

            <div className="grid gap-2 sm:col-span-1">
              <Label className="form-label mb-0" htmlFor="labtest-category">
                Category
              </Label>
              <div className="relative">
                <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="labtest-category"
                className="pl-9"
                value={formValues.category}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                placeholder="e.g., Hematology"
              />
              </div>
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label className="form-label mb-0" htmlFor="labtest-description">
                Description
              </Label>
              <Textarea
                id="labtest-description"
                value={formValues.description}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Describe what the lab test checks"
                rows={4}
              />
            </div>

            <div className="grid gap-2 sm:col-span-1">
              <Label className="form-label mb-0" htmlFor="labtest-price">
                Standard Price
              </Label>
              <div className="relative">
                <BadgeDollarSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="labtest-price"
                type="number"
                min="0"
                step="0.01"
                className="pl-9"
                value={formValues.standardPrice}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    standardPrice: Number(event.target.value) || 0,
                  }))
                }
                placeholder="0.00"
              />
              </div>
            </div>

            <div className="grid gap-2 sm:col-span-1">
              <Label className="form-label mb-0" htmlFor="labtest-status">
                Status
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={formValues.isActive ? "default" : "outline"}
                  onClick={() =>
                    setFormValues((current) => ({ ...current, isActive: true }))
                  }
                >
                  Active
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!formValues.isActive ? "default" : "outline"}
                  onClick={() =>
                    setFormValues((current) => ({
                      ...current,
                      isActive: false,
                    }))
                  }
                >
                  Inactive
                </Button>
              </div>
            </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedLabTest(null);
                setFormValues(createEmptyForm());
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? "Saving..."
                : selectedLabTest
                  ? "Update Lab Test"
                  : "Create Lab Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[680px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Eye className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Lab Test Details
                  </DialogTitle>
                  <DialogDescription>
                    Review the selected lab test record.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedLabTest && (
            <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 sm:col-span-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedLabTest.testName}
                  </h3>
                  <Badge variant="outline" className="rounded-full px-3 py-0.5">
                    #{selectedLabTest.id}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`rounded-full px-3 py-0.5 ${getStatusBadgeClasses(
                      Boolean(selectedLabTest.isActive),
                    )}`}
                  >
                    {selectedLabTest.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedLabTest.description}
                </p>
              </div>

              <div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Category
                </p>
                <p className="text-sm font-medium text-foreground">
                  {selectedLabTest.category}
                </p>
              </div>

              <div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Price
                </p>
                <p className="text-sm font-medium text-foreground">
                  LKR {Number(selectedLabTest.standardPrice).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Created
                </p>
                <p className="text-sm font-medium text-foreground">
                  {selectedLabTest.createdAt
                    ? new Date(selectedLabTest.createdAt).toLocaleString()
                    : "—"}
                </p>
              </div>

              <div className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Updated
                </p>
                <p className="text-sm font-medium text-foreground">
                  {selectedLabTest.updatedAt
                    ? new Date(selectedLabTest.updatedAt).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="gap-5 border-border/60 bg-card p-0 shadow-xl sm:max-w-[460px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <Trash2 className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Delete Lab Test
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this lab test?
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedLabTest && (
            <div className="px-6">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium">
                  {selectedLabTest.testName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedLabTest.category} · LKR{" "}
                  {Number(selectedLabTest.standardPrice).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setSelectedLabTest(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
