"use client";

import { useEffect, useMemo, useState } from "react";
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
  createLabTest,
  deleteLabTest,
  getActiveLabTests,
  getAllLabTests,
  getInactiveLabTests,
  updateLabTest,
  type LabTest,
  type LabTestPayload,
} from "@/lib/services/labtest-service";

type LabTestFilter = "all" | "active" | "inactive";

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLabTest, setSelectedLabTest] = useState<LabTest | null>(null);
  const [formValues, setFormValues] =
    useState<LabTestPayload>(createEmptyForm());

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
      console.log(data);

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
        accessor: "id",
        className: "w-[90px] px-5 py-4 font-semibold text-foreground",
      },
      {
        header: "Test Name",
        accessor: "testName",
        className: "w-[220px] px-5 py-4 font-medium text-foreground",
      },
      {
        header: "Category",
        accessor: "category",
        className: "w-[180px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Description",
        render: (labTest) => (
          <div className="max-w-[520px] whitespace-normal text-sm text-muted-foreground">
            {labTest.description}
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
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => openDetailsDialog(labTest)}
            >
              <Eye className="size-4" />
              <span className="sr-only">View lab test</span>
            </Button>

            {canManage && (
              <>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => openEditDialog(labTest)}
                >
                  <Edit3 className="size-4" />
                  <span className="sr-only">Edit lab test</span>
                </Button>

                <Button
                  size="icon-sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => openDeleteDialog(labTest)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete lab test</span>
                </Button>
              </>
            )}
          </div>
        ),
        className: "w-[180px] px-5 py-4 text-center",
      },
    ],
    [canManage],
  );

  const filterButtons: Array<{ value: LabTestFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
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
          <Button
            onClick={() => fetchLabTests(filter)}
            size="sm"
            variant="outline"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>

          {canManage && (
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4" /> New Lab Test
            </Button>
          )}
        </div>
      </div>

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

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50 shadow-sm">
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
            data={labTests}
            pageable={true}
            pageSize={10}
            showActions={false}
            emptyMessage="No lab tests found."
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedLabTest ? "Edit Lab Test" : "Create Lab Test"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor="labtest-name">Test Name</Label>
              <Input
                id="labtest-name"
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

            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor="labtest-category">Category</Label>
              <Input
                id="labtest-category"
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

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="labtest-description">Description</Label>
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
              <Label htmlFor="labtest-price">Standard Price</Label>
              <Input
                id="labtest-price"
                type="number"
                min="0"
                step="0.01"
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

            <div className="grid gap-2 sm:col-span-1">
              <Label htmlFor="labtest-status">Status</Label>
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

          <DialogFooter className="mt-4 gap-2">
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
        <DialogContent className="sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Lab Test Details
            </DialogTitle>
          </DialogHeader>

          {selectedLabTest && (
            <div className="grid gap-4 py-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 sm:col-span-2">
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

              <div className="space-y-1 rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Category
                </p>
                <p className="text-sm font-medium text-foreground">
                  {selectedLabTest.category}
                </p>
              </div>

              <div className="space-y-1 rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Price
                </p>
                <p className="text-sm font-medium text-foreground">
                  LKR {Number(selectedLabTest.standardPrice).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1 rounded-2xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Created
                </p>
                <p className="text-sm font-medium text-foreground">
                  {selectedLabTest.createdAt
                    ? new Date(selectedLabTest.createdAt).toLocaleString()
                    : "—"}
                </p>
              </div>

              <div className="space-y-1 rounded-2xl border border-border/60 p-4">
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Delete Lab Test
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this lab test? This action cannot be
            undone.
          </p>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setSelectedLabTest(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Lab Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
