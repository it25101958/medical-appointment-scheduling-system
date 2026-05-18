"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BadgeDollarSign,
  CalendarDays,
  CreditCard,
  Edit3,
  Eye,
  Hash,
  Plus,
  ReceiptText,
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

import { paymentApi } from "../api/payment.api";
import type { PaymentPayload, PaymentResponse } from "../types/payment.types";

const statusOptions = [
  { value: 0, label: "Pending" },
  { value: 1, label: "Completed" },
  { value: 2, label: "Failed" },
  { value: 3, label: "Refunded" },
];

const paymentMethods = ["CASH", "CARD", "ONLINE", "BANK_TRANSFER"];

interface PaymentFormValues {
  patientId: string;
  appointmentId: string;
  amount: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
}

function createEmptyForm(): PaymentFormValues {
  return {
    patientId: "",
    appointmentId: "",
    amount: "",
    paymentMethod: "CASH",
    paymentStatus: "1",
    transactionId: "",
  };
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function formatCurrency(value: number | string | undefined) {
  return `LKR ${Number(value || 0).toLocaleString()}`;
}

function getStatusLabel(status: number) {
  return (
    statusOptions.find((option) => option.value === Number(status))?.label ||
    `Status ${status}`
  );
}

function getStatusClasses(status: number) {
  const styles: Record<number, string> = {
    0: "border-amber-200 bg-amber-50 text-amber-700",
    1: "border-emerald-200 bg-emerald-50 text-emerald-700",
    2: "border-red-200 bg-red-50 text-red-700",
    3: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    styles[Number(status)] || "border-slate-200 bg-slate-50 text-slate-700"
  );
}

function buildPayload(values: PaymentFormValues): PaymentPayload {
  return {
    patientId: Number(values.patientId),
    appointmentId: Number(values.appointmentId),
    amount: Number(values.amount),
    paymentMethod: values.paymentMethod,
    paymentStatus: Number(values.paymentStatus),
    transactionId: values.transactionId.trim(),
  };
}

interface PaymentManagementProps {
  title: string;
  description: string;
  canManage?: boolean;
  canDelete?: boolean;
  patientId?: number;
}

export function PaymentManagement({
  title,
  description,
  canManage = true,
  canDelete = false,
  patientId,
}: PaymentManagementProps) {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentResponse | null>(null);
  const [formValues, setFormValues] =
    useState<PaymentFormValues>(createEmptyForm());

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = patientId
        ? await paymentApi.getByPatient(patientId)
        : await paymentApi.getAll();
      setPayments(data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load payment records"));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    const query = normalize(deferredSearchQuery);
    if (!query) return payments;

    return payments.filter((payment) => {
      const haystack = [
        payment.paymentId?.toString(),
        payment.patientId?.toString(),
        payment.appointmentId?.toString(),
        payment.amount?.toString(),
        payment.paymentMethod,
        getStatusLabel(payment.paymentStatus),
        payment.transactionId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [deferredSearchQuery, payments]);

  function openCreateDialog() {
    setSelectedPayment(null);
    setFormValues({
      ...createEmptyForm(),
      patientId: patientId ? String(patientId) : "",
    });
    setDialogOpen(true);
  }

  const openEditDialog = useCallback(
    (payment: PaymentResponse) => {
      setSelectedPayment(payment);
      setFormValues({
        patientId: String(patientId || payment.patientId || ""),
        appointmentId: String(payment.appointmentId || ""),
        amount: String(payment.amount || ""),
        paymentMethod: payment.paymentMethod || "CASH",
        paymentStatus: String(payment.paymentStatus ?? 1),
        transactionId: payment.transactionId || "",
      });
      setDialogOpen(true);
    },
    [patientId],
  );

  function openDetailsDialog(payment: PaymentResponse) {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  }

  function openDeleteDialog(payment: PaymentResponse) {
    setSelectedPayment(payment);
    setDeleteOpen(true);
  }

  async function handleSave() {
    if (Number(formValues.patientId) <= 0) {
      toast.error("Patient ID is required.");
      return;
    }
    if (Number(formValues.appointmentId) <= 0) {
      toast.error("Appointment ID is required.");
      return;
    }
    if (Number(formValues.amount) <= 0) {
      toast.error("Amount must be greater than 0.");
      return;
    }
    if (!formValues.transactionId.trim()) {
      toast.error("Transaction ID is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(formValues);
      if (selectedPayment) {
        await paymentApi.update(selectedPayment.paymentId, payload);
        toast.success("Payment updated.");
      } else {
        await paymentApi.create(payload);
        toast.success("Payment created.");
      }

      setDialogOpen(false);
      setSelectedPayment(null);
      setFormValues(createEmptyForm());
      await fetchPayments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save payment"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedPayment) return;

    setDeleting(true);
    try {
      await paymentApi.delete(selectedPayment.paymentId);
      toast.success("Payment deleted.");
      setDeleteOpen(false);
      setSelectedPayment(null);
      await fetchPayments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete payment"));
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<PaymentResponse>[] = useMemo(
    () => [
      {
        header: "Payment ID",
        render: (payment) =>
          highlightText(`#${payment.paymentId}`, deferredSearchQuery),
        className: "w-[130px] px-5 py-4 font-medium",
      },
      {
        header: "Patient",
        render: (payment) =>
          highlightText(`#${payment.patientId}`, deferredSearchQuery),
        className: "w-[120px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Appointment",
        render: (payment) =>
          highlightText(`#${payment.appointmentId}`, deferredSearchQuery),
        className: "w-[140px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Amount",
        render: (payment) => (
          <span className="font-medium">{formatCurrency(payment.amount)}</span>
        ),
        className: "w-[150px] px-5 py-4",
      },
      {
        header: "Method",
        render: (payment) =>
          highlightText(payment.paymentMethod || "-", deferredSearchQuery),
        className: "w-[150px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Status",
        render: (payment) => (
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-0.5 text-xs ${getStatusClasses(
              payment.paymentStatus,
            )}`}
          >
            {getStatusLabel(payment.paymentStatus)}
          </Badge>
        ),
        className: "w-[140px] px-5 py-4",
      },
      {
        header: "Transaction",
        render: (payment) =>
          highlightText(payment.transactionId || "-", deferredSearchQuery),
        className: "w-[190px] px-5 py-4 text-muted-foreground",
      },
      {
        header: "Actions",
        render: (payment) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => openDetailsDialog(payment)}
              aria-label="View payment"
              title="View"
            >
              <Eye className="size-4" />
            </Button>
            {canManage && (
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => openEditDialog(payment)}
                aria-label="Edit payment"
                title="Edit"
              >
                <Edit3 className="size-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="icon-sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => openDeleteDialog(payment)}
                aria-label="Delete payment"
                title="Delete"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ),
        className: "w-[150px] px-5 py-4 text-center",
      },
    ],
    [canDelete, canManage, deferredSearchQuery, openEditDialog],
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
              onClick={fetchPayments}
              aria-label="Refresh payments"
              title="Refresh"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            {canManage && (
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                New Payment
              </Button>
            )}
          </>
        }
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by payment, patient, appointment, method, status, or transaction"
        resultCount={filteredPayments.length}
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Loading payments...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredPayments}
            pageable
            pageSize={10}
            showActions={false}
            emptyMessage="No payment records found."
            minWidth="1150px"
          />
        )}
      </div>

      <PaymentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        values={formValues}
        setValues={setFormValues}
        selectedPayment={selectedPayment}
        saving={saving}
        patientLocked={Boolean(patientId)}
        onSave={handleSave}
        onCancel={() => {
          setDialogOpen(false);
          setSelectedPayment(null);
          setFormValues(createEmptyForm());
        }}
      />

      <PaymentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        payment={selectedPayment}
      />

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
                    Delete Payment
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this payment record?
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedPayment && (
            <div className="px-6">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-sm font-medium">
                  Payment #{selectedPayment.paymentId}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(selectedPayment.amount)} ·{" "}
                  {getStatusLabel(selectedPayment.paymentStatus)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setSelectedPayment(null);
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

function PaymentFormDialog({
  open,
  onOpenChange,
  values,
  setValues,
  selectedPayment,
  saving,
  patientLocked,
  onSave,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: PaymentFormValues;
  setValues: React.Dispatch<React.SetStateAction<PaymentFormValues>>;
  selectedPayment: PaymentResponse | null;
  saving: boolean;
  patientLocked: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  function updateValue<K extends keyof PaymentFormValues>(
    key: K,
    value: PaymentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[720px]">
        <DialogHeader>
          <div className="border-b border-border/60 px-6 pb-5 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  {selectedPayment ? "Edit Payment" : "Create Payment"}
                </DialogTitle>
                <DialogDescription>
                  Record payment information for an appointment.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <PaymentInput
              label="Patient ID *"
              value={values.patientId}
              onChange={(value) => updateValue("patientId", value)}
              icon={<Hash className="size-4" />}
              type="number"
              disabled={patientLocked}
            />
            <PaymentInput
              label="Appointment ID *"
              value={values.appointmentId}
              onChange={(value) => updateValue("appointmentId", value)}
              icon={<CalendarDays className="size-4" />}
              type="number"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PaymentInput
              label="Amount *"
              value={values.amount}
              onChange={(value) => updateValue("amount", value)}
              icon={<BadgeDollarSign className="size-4" />}
              type="number"
              placeholder="0.00"
            />
            <PaymentInput
              label="Transaction ID *"
              value={values.transactionId}
              onChange={(value) => updateValue("transactionId", value)}
              icon={<ReceiptText className="size-4" />}
              placeholder="e.g., TXN-10021"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label className="form-label mb-0">Payment Method</Label>
              <Select
                value={values.paymentMethod}
                onValueChange={(value) => updateValue("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                >
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0">Payment Status</Label>
              <Select
                value={values.paymentStatus}
                onValueChange={(value) => updateValue("paymentStatus", value)}
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
                    <SelectItem key={status.value} value={String(status.value)}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving
              ? "Saving..."
              : selectedPayment
                ? "Save Changes"
                : "Create Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDetailsDialog({
  open,
  onOpenChange,
  payment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentResponse | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[620px]">
        <DialogHeader>
          <div className="border-b border-border/60 px-6 pb-5 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Eye className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Payment Details
                </DialogTitle>
                <DialogDescription>
                  Review the selected payment record.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {payment && (
          <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4 sm:col-span-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">
                  Payment #{payment.paymentId}
                </h3>
                <Badge
                  variant="outline"
                  className={`rounded-full px-3 py-0.5 ${getStatusClasses(
                    payment.paymentStatus,
                  )}`}
                >
                  {getStatusLabel(payment.paymentStatus)}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Transaction {payment.transactionId || "-"}
              </p>
            </div>

            <InfoPanel label="Amount" value={formatCurrency(payment.amount)} />
            <InfoPanel label="Method" value={payment.paymentMethod || "-"} />
            <InfoPanel label="Patient" value={`#${payment.patientId}`} />
            <InfoPanel
              label="Appointment"
              value={`#${payment.appointmentId}`}
            />
            <InfoPanel
              label="Created"
              value={
                payment.createdAt
                  ? new Date(payment.createdAt).toLocaleString()
                  : "-"
              }
            />
            <InfoPanel
              label="Updated"
              value={
                payment.updatedAt
                  ? new Date(payment.updatedAt).toLocaleString()
                  : "-"
              }
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentInput({
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
  icon: ReactNode;
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
