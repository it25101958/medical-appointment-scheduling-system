"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BadgeDollarSign,
  CalendarDays,
  CreditCard,
  Edit3,
  Eye,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Badge,
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  PageHeader,
  SearchBar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Column,
} from "@/components/ui";
import { highlightText } from "@/lib/highlight-search";
import { getErrorMessage } from "@/lib/utils";

import { billingApi } from "../api/billing.api";
import type {
  BillingPayload,
  BillingResponse,
  BillingStatus,
} from "../types/billing.types";

const statusOptions: BillingStatus[] = [
  "PENDING",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

interface BillingFormValues {
  appointmentId: string;
  patientId: string;
  totalAmount: string;
  discount: string;
  tax: string;
  dueDate: string;
  status: BillingStatus;
}

function createEmptyForm(): BillingFormValues {
  return {
    appointmentId: "",
    patientId: "",
    totalAmount: "",
    discount: "0",
    tax: "0",
    dueDate: "",
    status: "PENDING",
  };
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function formatCurrency(value: number | string | undefined) {
  return `LKR ${Number(value || 0).toLocaleString()}`;
}

function getStatusClasses(status: BillingStatus) {
  const styles: Record<BillingStatus, string> = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
    OVERDUE: "border-red-200 bg-red-50 text-red-700",
    CANCELLED: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return styles[status] || styles.PENDING;
}

function buildPayload(values: BillingFormValues): BillingPayload {
  const appointmentId = Number(values.appointmentId);
  const patientId = Number(values.patientId);

  return {
    appointment:
      Number.isFinite(appointmentId) && appointmentId > 0
        ? { appointmentId }
        : undefined,
    patient:
      Number.isFinite(patientId) && patientId > 0 ? { patientId } : undefined,
    totalAmount: Number(values.totalAmount),
    discount: Number(values.discount || 0),
    tax: Number(values.tax || 0),
    dueDate: values.dueDate || undefined,
    status: values.status,
  };
}

interface BillingManagementProps {
  title: string;
  description: string;
  canManage?: boolean;
  patientId?: number;
}

export function BillingManagement({
  title,
  description,
  canManage = true,
  patientId,
}: BillingManagementProps) {
  const [billings, setBillings] = useState<BillingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] =
    useState<BillingResponse | null>(null);
  const [formValues, setFormValues] = useState(createEmptyForm());

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const fetchBillings = useCallback(async () => {
    setLoading(true);
    try {
      const data = patientId
        ? await billingApi.getByPatient(patientId)
        : await billingApi.getAll();
      setBillings(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load billing records"));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchBillings();
  }, [fetchBillings]);

  const filteredBillings = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return billings;

    return billings.filter((billing) => {
      const haystack = [
        billing.billingId?.toString(),
        billing.appointmentId?.toString(),
        billing.finalAmount?.toString(),
        billing.status,
        billing.billingDate,
        billing.dueDate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [billings, deferredSearchQuery]);

  function openCreateDialog() {
    setSelectedBilling(null);
    setFormValues(createEmptyForm());
    setDialogOpen(true);
  }

  const openEditDialog = useCallback(
    (billing: BillingResponse) => {
      setSelectedBilling(billing);
      setFormValues({
        appointmentId: billing.appointmentId
          ? String(billing.appointmentId)
          : "",
        patientId: patientId ? String(patientId) : "",
        totalAmount: String(billing.finalAmount || ""),
        discount: "0",
        tax: "0",
        dueDate: billing.dueDate || "",
        status: billing.status,
      });
      setDialogOpen(true);
    },
    [patientId],
  );

  function openDetailsDialog(billing: BillingResponse) {
    setSelectedBilling(billing);
    setDetailsOpen(true);
  }

  function openDeleteDialog(billing: BillingResponse) {
    setSelectedBilling(billing);
    setDeleteOpen(true);
  }

  async function handleSave() {
    if (!Number(formValues.totalAmount) || Number(formValues.totalAmount) <= 0) {
      toast.error("Total amount must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(formValues);
      if (selectedBilling) {
        await billingApi.update(selectedBilling.billingId, payload);
        toast.success("Billing record updated.");
      } else {
        await billingApi.create(payload);
        toast.success("Billing record created.");
      }

      setDialogOpen(false);
      setSelectedBilling(null);
      setFormValues(createEmptyForm());
      await fetchBillings();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save billing record"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedBilling) return;

    setDeleting(true);
    try {
      await billingApi.delete(selectedBilling.billingId);
      toast.success("Billing record deleted.");
      setDeleteOpen(false);
      setSelectedBilling(null);
      await fetchBillings();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete billing record"));
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<BillingResponse>[] = useMemo(
    () => [
      {
        header: "Billing ID",
        render: (billing) =>
          highlightText(`#${billing.billingId}`, deferredSearchQuery),
        className: "w-[130px] px-5 py-4 font-medium",
      },
      {
        header: "Appointment",
        render: (billing) =>
          highlightText(
            billing.appointmentId ? `#${billing.appointmentId}` : "Not linked",
            deferredSearchQuery,
          ),
        className: "w-[150px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Final Amount",
        render: (billing) => (
          <span className="font-medium">{formatCurrency(billing.finalAmount)}</span>
        ),
        className: "w-[160px] px-5 py-4",
      },
      {
        header: "Billing Date",
        render: (billing) => (
          <span className="text-sm text-muted-foreground">
            {billing.billingDate
              ? new Date(billing.billingDate).toLocaleDateString()
              : "-"}
          </span>
        ),
        className: "w-[150px] px-5 py-4",
      },
      {
        header: "Due Date",
        render: (billing) => (
          <span className="text-sm text-muted-foreground">
            {billing.dueDate
              ? new Date(billing.dueDate).toLocaleDateString()
              : "-"}
          </span>
        ),
        className: "w-[150px] px-5 py-4",
      },
      {
        header: "Status",
        render: (billing) => (
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-0.5 text-xs ${getStatusClasses(
              billing.status,
            )}`}
          >
            {billing.status}
          </Badge>
        ),
        className: "w-[130px] px-5 py-4",
      },
      {
        header: "Actions",
        render: (billing) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => openDetailsDialog(billing)}
              aria-label="View billing"
              title="View"
            >
              <Eye className="size-4" />
            </Button>
            {canManage && (
              <>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => openEditDialog(billing)}
                  aria-label="Edit billing"
                  title="Edit"
                >
                  <Edit3 className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => openDeleteDialog(billing)}
                  aria-label="Delete billing"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}
          </div>
        ),
        className: "w-[150px] px-5 py-4 text-center",
      },
    ],
    [canManage, deferredSearchQuery, openEditDialog],
  );

  return (
    <div className="space-y-6 col-start-1 col-end-14">
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchBillings}
              aria-label="Refresh billing"
              title="Refresh"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            {canManage && (
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                New Billing
              </Button>
            )}
          </>
        }
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by billing ID, appointment, amount, status, or date"
        resultCount={filteredBillings.length}
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Loading billing records...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredBillings}
            pageable
            pageSize={10}
            showActions={false}
            emptyMessage="No billing records found."
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[720px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    {selectedBilling ? "Edit Billing" : "Create Billing"}
                  </DialogTitle>
                  <DialogDescription>
                    Create or update patient billing records for appointments.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-sm font-medium leading-none">
                Billing Details
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Final amount is calculated by the backend as total minus
                discount plus tax.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BillingInput
                label="Appointment ID"
                value={formValues.appointmentId}
                onChange={(value) =>
                  setFormValues((current) => ({
                    ...current,
                    appointmentId: value,
                  }))
                }
                icon={<CalendarDays className="size-4" />}
                placeholder="e.g., 12"
                type="number"
              />
              <BillingInput
                label="Patient ID"
                value={formValues.patientId}
                onChange={(value) =>
                  setFormValues((current) => ({ ...current, patientId: value }))
                }
                icon={<CreditCard className="size-4" />}
                placeholder="Optional"
                type="number"
                disabled={Boolean(patientId)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <BillingInput
                label="Total Amount *"
                value={formValues.totalAmount}
                onChange={(value) =>
                  setFormValues((current) => ({
                    ...current,
                    totalAmount: value,
                  }))
                }
                icon={<BadgeDollarSign className="size-4" />}
                placeholder="0.00"
                type="number"
              />
              <BillingInput
                label="Discount"
                value={formValues.discount}
                onChange={(value) =>
                  setFormValues((current) => ({ ...current, discount: value }))
                }
                icon={<BadgeDollarSign className="size-4" />}
                placeholder="0.00"
                type="number"
              />
              <BillingInput
                label="Tax"
                value={formValues.tax}
                onChange={(value) =>
                  setFormValues((current) => ({ ...current, tax: value }))
                }
                icon={<BadgeDollarSign className="size-4" />}
                placeholder="0.00"
                type="number"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BillingInput
                label="Due Date"
                value={formValues.dueDate}
                onChange={(value) =>
                  setFormValues((current) => ({ ...current, dueDate: value }))
                }
                icon={<CalendarDays className="size-4" />}
                type="date"
              />
              <div className="grid gap-2">
                <Label className="form-label mb-0">Status</Label>
                <Select
                  value={formValues.status}
                  onValueChange={(value) =>
                    setFormValues((current) => ({
                      ...current,
                      status: value as BillingStatus,
                    }))
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
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedBilling(null);
                setFormValues(createEmptyForm());
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? "Saving..."
                : selectedBilling
                  ? "Save Changes"
                  : "Create Billing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[620px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Eye className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Billing Details
                  </DialogTitle>
                  <DialogDescription>
                    Review the selected billing record.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedBilling && (
            <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 sm:col-span-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    Billing #{selectedBilling.billingId}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`rounded-full px-3 py-0.5 ${getStatusClasses(
                      selectedBilling.status,
                    )}`}
                  >
                    {selectedBilling.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Appointment{" "}
                  {selectedBilling.appointmentId
                    ? `#${selectedBilling.appointmentId}`
                    : "not linked"}
                </p>
              </div>

              <InfoPanel
                label="Final Amount"
                value={formatCurrency(selectedBilling.finalAmount)}
              />
              <InfoPanel
                label="Billing Date"
                value={
                  selectedBilling.billingDate
                    ? new Date(selectedBilling.billingDate).toLocaleString()
                    : "-"
                }
              />
              <InfoPanel
                label="Due Date"
                value={
                  selectedBilling.dueDate
                    ? new Date(selectedBilling.dueDate).toLocaleString()
                    : "-"
                }
              />
              <InfoPanel label="Status" value={selectedBilling.status} />
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
                    Delete Billing
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this billing record?
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedBilling && (
            <div className="px-6">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium">
                  Billing #{selectedBilling.billingId}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(selectedBilling.finalAmount)} ·{" "}
                  {selectedBilling.status}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setSelectedBilling(null);
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

function BillingInput({
  label,
  value,
  onChange,
  icon,
  type = "text",
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label className="form-label mb-0">{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <Input
          type={type}
          className="pl-9"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function InfoPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
