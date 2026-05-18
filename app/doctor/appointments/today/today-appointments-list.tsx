"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ClipboardPlus, FileText, Pill, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api-client";
import { AppointmentResponse } from "@/features/appointments/types/appointment.types";
import { cn, getErrorMessage } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppointmentDetailsDialog } from "@/features/appointments/components/appointment-details-dialog";
import {
  getMedicationsByStatus,
  type Medication,
} from "@/lib/services/medication-service";
import {
  getLaboratories,
  type Laboratory,
} from "@/lib/services/laboratory-service";
import {
  getActiveLabTests,
  type LabTest,
} from "@/lib/services/labtest-service";
import { labOrderApi } from "@/features/lab-orders/api/lab-order.api";
import type {
  LabOrderRequest,
  LabOrderResponse,
} from "@/features/lab-orders/types/lab-order.types";

interface Props {
  appointments: AppointmentResponse[];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 text-xs font-normal",
        styles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </Badge>
  );
}

function formatTime(time: string) {
  if (!time) return "Not set";

  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute));

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAppointmentWindow(appointment: AppointmentResponse) {
  const start = new Date(
    `${appointment.appointmentDate}T${appointment.appointmentTime}`,
  );
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + (appointment.durationMinutes || 30));

  return { start, end };
}

function getClinicalAccessMessage(appointment: AppointmentResponse, now: Date) {
  if (appointment.status === "CANCELLED") {
    return "Cancelled appointments cannot be modified.";
  }

  if (appointment.status === "COMPLETED") {
    return "Completed appointments cannot be modified.";
  }

  const { start, end } = getAppointmentWindow(appointment);

  if (now < start) {
    return "Available when the appointment starts.";
  }

  if (now >= end) {
    return "Appointment time has ended.";
  }

  return "";
}

type PrescriptionDraftItem = {
  medicationId: number;
  dosage: string;
  quantity: number;
  specialInstructions: string;
};

function createPrescriptionItem(): PrescriptionDraftItem {
  return {
    medicationId: 0,
    dosage: "",
    quantity: 1,
    specialInstructions: "",
  };
}

function getMedicationLabel(medication: Medication) {
  const parts = [
    medication.name,
    medication.genericName,
    medication.dosage,
    medication.dosageForm,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);

  return parts.join(" - ");
}

type LabOrderDraftItem = {
  labTestId: number;
  quantity: number;
};

function createLabOrderItem(): LabOrderDraftItem {
  return {
    labTestId: 0,
    quantity: 1,
  };
}

export function TodayAppointmentsList({ appointments }: Props) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentResponse | null>(null);
  const [linkedRecordsRefreshKey, setLinkedRecordsRefreshKey] = useState(0);
  const [loadingAppointmentId, setLoadingAppointmentId] = useState<
    number | null
  >(null);
  const [now, setNow] = useState(() => new Date());
  const [clinicalAppointment, setClinicalAppointment] =
    useState<AppointmentResponse | null>(null);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [labOrderOpen, setLabOrderOpen] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loadingClinicalData, setLoadingClinicalData] = useState(false);
  const [checkingLabOrder, setCheckingLabOrder] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [savingLabOrder, setSavingLabOrder] = useState(false);
  const [prescriptionStatus, setPrescriptionStatus] = useState("ACTIVE");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<
    PrescriptionDraftItem[]
  >([createPrescriptionItem()]);
  const [laboratoryId, setLaboratoryId] = useState(0);
  const [labOrderItems, setLabOrderItems] = useState<LabOrderDraftItem[]>([
    createLabOrderItem(),
  ]);

  const activeMedications = useMemo(() => {
    return medications.filter((medication) => {
      const status = medication.status?.toUpperCase();
      return !status || status === "AVAILABLE";
    });
  }, [medications]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  async function loadClinicalData() {
    if (medications.length && laboratories.length && labTests.length) {
      return;
    }

    setLoadingClinicalData(true);
    try {
      const [medicationData, laboratoryData, labTestData] = await Promise.all([
        getMedicationsByStatus("AVAILABLE"),
        getLaboratories(),
        getActiveLabTests(),
      ]);

      setMedications(medicationData || []);
      setLaboratories(laboratoryData || []);
      setLabTests(labTestData || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load clinical form data"));
    } finally {
      setLoadingClinicalData(false);
    }
  }

  function openPrescriptionDialog(appointment: AppointmentResponse) {
    setClinicalAppointment(appointment);
    setPrescriptionStatus("ACTIVE");
    setPrescriptionNotes("");
    setPrescriptionItems([createPrescriptionItem()]);
    setPrescriptionOpen(true);
    loadClinicalData();
  }

  async function findLabOrderForAppointment(appointmentId: number) {
    const orders = await labOrderApi.search();
    return (orders || []).find(
      (order: LabOrderResponse) =>
        Number(order.appointmentId) === Number(appointmentId),
    );
  }

  async function openLabOrderDialog(appointment: AppointmentResponse) {
    setCheckingLabOrder(true);
    try {
      const existingOrder = await findLabOrderForAppointment(
        appointment.appointmentId,
      );

      if (existingOrder) {
        toast.error("Lab order already exists", {
          description: `Appointment #${appointment.appointmentId} already has lab order #${existingOrder.labOrderId}.`,
        });
        setSelectedAppointment(appointment);
        setLinkedRecordsRefreshKey((current) => current + 1);
        return;
      }

      setClinicalAppointment(appointment);
      setLaboratoryId(0);
      setLabOrderItems([createLabOrderItem()]);
      setLabOrderOpen(true);
      loadClinicalData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not check lab orders"));
    } finally {
      setCheckingLabOrder(false);
    }
  }

  function updatePrescriptionItem(
    index: number,
    patch: Partial<PrescriptionDraftItem>,
  ) {
    setPrescriptionItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function updateLabOrderItem(
    index: number,
    patch: Partial<LabOrderDraftItem>,
  ) {
    setLabOrderItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  async function savePrescription() {
    if (!clinicalAppointment) return;

    const validItems = prescriptionItems.every(
      (item) =>
        item.medicationId > 0 &&
        item.dosage.trim().length > 0 &&
        item.quantity > 0,
    );

    if (!validItems) {
      toast.error("Select medication, dosage, and quantity for each item.");
      return;
    }

    setSavingPrescription(true);
    try {
      await apiRequest("/prescription", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: clinicalAppointment.appointmentId,
          status: prescriptionStatus,
          notes: prescriptionNotes.trim() || undefined,
          items: prescriptionItems.map((item) => ({
            medicationId: item.medicationId,
            dosage: item.dosage.trim(),
            quantity: item.quantity,
            specialInstructions: item.specialInstructions.trim() || undefined,
          })),
        }),
      });

      toast.success("Prescription created successfully.");
      setPrescriptionOpen(false);
      setLinkedRecordsRefreshKey((current) => current + 1);
      setSelectedAppointment(clinicalAppointment);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create prescription"));
    } finally {
      setSavingPrescription(false);
    }
  }

  async function saveLabOrder() {
    if (!clinicalAppointment) return;

    const payload: LabOrderRequest = {
      appointmentId: clinicalAppointment.appointmentId,
      laboratoryId,
      items: labOrderItems,
    };

    const validItems =
      payload.laboratoryId > 0 &&
      payload.items.every((item) => item.labTestId > 0 && item.quantity > 0);

    if (!validItems) {
      toast.error("Select laboratory, lab tests, and quantity.");
      return;
    }

    setSavingLabOrder(true);
    try {
      await labOrderApi.create(payload);
      toast.success("Lab order created successfully.");
      setLabOrderOpen(false);
      setLinkedRecordsRefreshKey((current) => current + 1);
      setSelectedAppointment(clinicalAppointment);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create lab order"));
    } finally {
      setSavingLabOrder(false);
    }
  }

  async function loadAppointment(appointmentId: number) {
    setLoadingAppointmentId(appointmentId);
    setSelectedAppointment(null);

    try {
      const appointment = await apiRequest<AppointmentResponse>(
        `/appointment/${appointmentId}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      setSelectedAppointment(appointment);
    } finally {
      setLoadingAppointmentId(null);
    }
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-sm col-start-1 col-end-14">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
          <CalendarClock className="size-7 text-muted-foreground" />
        </div>

        <h2 className="text-lg font-medium">No appointments today</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You do not have any scheduled consultations for today.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <ScrollArea className="w-full rounded-2xl">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[110px]">
                  Queue
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[130px]">
                  Time
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[130px]">
                  Patient
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[130px]">
                  Room
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[150px]">
                  Type
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[130px]">
                  Status
                </TableHead>
                <TableHead className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground min-w-[220px]">
                  Notes
                </TableHead>
                <TableHead className="px-4 py-2 text-center text-xs font-medium tracking-wide text-muted-foreground min-w-[120px]">
                  View
                </TableHead>
                <TableHead className="px-4 py-2 text-center text-xs font-medium tracking-wide text-muted-foreground min-w-[160px]">
                  Prescription
                </TableHead>
                <TableHead className="px-4 py-2 text-center text-xs font-medium tracking-wide text-muted-foreground min-w-[160px]">
                  Lab Order
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {appointments.map((appointment) => (
                <TableRow
                  key={appointment.appointmentId}
                  className="hover:bg-muted/20"
                >
                  <TableCell className="px-4 py-2">
                    <span className="text-sm">
                      {appointment.appointmentNumber}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span className="text-sm">
                      {formatTime(appointment.appointmentTime)}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span className="text-sm">
                      Patient {appointment.patient.FullName}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span className="text-sm">
                      Room {appointment.room.roomNumber}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span className="text-sm">
                      {appointment.appointmentType}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <StatusBadge status={appointment.status} />
                  </TableCell>

                  <TableCell className="px-4 py-2">
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {appointment.notes || "No notes added"}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => loadAppointment(appointment.appointmentId)}
                      disabled={
                        loadingAppointmentId === appointment.appointmentId
                      }
                    >
                      {loadingAppointmentId === appointment.appointmentId
                        ? "Loading..."
                        : "View"}
                    </Button>
                  </TableCell>

                  <TableCell className="px-4 py-2 text-center">
                    {(() => {
                      const clinicalAccessMessage = getClinicalAccessMessage(
                        appointment,
                        now,
                      );
                      const canModifyClinical = !clinicalAccessMessage;

                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => openPrescriptionDialog(appointment)}
                          disabled={!canModifyClinical}
                          title={clinicalAccessMessage || undefined}
                        >
                          Add Prescription
                        </Button>
                      );
                    })()}
                  </TableCell>

                  <TableCell className="px-4 py-2 text-center">
                    {(() => {
                      const clinicalAccessMessage = getClinicalAccessMessage(
                        appointment,
                        now,
                      );
                      const canModifyClinical = !clinicalAccessMessage;

                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => openLabOrderDialog(appointment)}
                          disabled={!canModifyClinical || checkingLabOrder}
                          title={clinicalAccessMessage || undefined}
                        >
                          {checkingLabOrder ? "Checking..." : "Add Lab Order"}
                        </Button>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        linkedRecordsRefreshKey={linkedRecordsRefreshKey}
      />

      <Dialog open={prescriptionOpen} onOpenChange={setPrescriptionOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-card p-0 shadow-xl sm:max-w-[920px]">
          <DialogHeader>
            <div className="border-b border-border/60 px-6 pb-5 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ClipboardPlus className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    Create Prescription
                  </DialogTitle>
                  <DialogDescription>
                    Add medication instructions for the active appointment.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-primary ring-1 ring-border/70">
                  <CalendarClock className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {clinicalAppointment
                      ? `Appointment #${clinicalAppointment.appointmentId}`
                      : "Appointment"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {clinicalAppointment
                      ? `${clinicalAppointment.appointmentDate} at ${formatTime(
                          clinicalAppointment.appointmentTime,
                        )}`
                      : "Prescription will be linked to the selected appointment."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="form-label mb-0">Status</Label>
                <Select
                  value={prescriptionStatus}
                  onValueChange={setPrescriptionStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                  >
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="form-label mb-0" htmlFor="prescription-notes">
                Notes
              </Label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                <Textarea
                  id="prescription-notes"
                  className="pl-9"
                  value={prescriptionNotes}
                  onChange={(event) => setPrescriptionNotes(event.target.value)}
                  placeholder="Optional prescription notes"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label className="form-label mb-0">Medication Items</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add each medicine, dosage, quantity, and patient guidance.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPrescriptionItems((current) => [
                      ...current,
                      createPrescriptionItem(),
                    ])
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {prescriptionItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border/60 bg-muted/20 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border/70">
                        <Pill className="size-4" />
                      </div>
                      <p className="text-sm font-medium">
                        Medication {index + 1}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        setPrescriptionItems((current) =>
                          current.length === 1
                            ? current
                            : current.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                        )
                      }
                      disabled={prescriptionItems.length === 1}
                      aria-label="Remove medication"
                      title="Remove medication"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_130px_100px_minmax(0,1fr)]">
                    <div className="grid gap-2">
                      <Label className="form-label mb-0">Medication</Label>
                      <Select
                        value={
                          item.medicationId ? String(item.medicationId) : ""
                        }
                        onValueChange={(value) =>
                          updatePrescriptionItem(index, {
                            medicationId: Number(value),
                          })
                        }
                        disabled={loadingClinicalData}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingClinicalData
                                ? "Loading..."
                                : "Select medication"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          align="start"
                          className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]"
                        >
                          {activeMedications.map((medication) => (
                            <SelectItem
                              key={medication.medicationId}
                              value={String(medication.medicationId)}
                            >
                              {getMedicationLabel(medication)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label className="form-label mb-0">Dosage</Label>
                      <Input
                        value={item.dosage}
                        onChange={(event) =>
                          updatePrescriptionItem(index, {
                            dosage: event.target.value,
                          })
                        }
                        placeholder="1 tablet"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label className="form-label mb-0">Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity || ""}
                        onChange={(event) =>
                          updatePrescriptionItem(index, {
                            quantity: Number(event.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label className="form-label mb-0">Instructions</Label>
                      <Input
                        value={item.specialInstructions}
                        onChange={(event) =>
                          updatePrescriptionItem(index, {
                            specialInstructions: event.target.value,
                          })
                        }
                        placeholder="After meals"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setPrescriptionOpen(false)}
              disabled={savingPrescription}
            >
              Cancel
            </Button>
            <Button onClick={savePrescription} disabled={savingPrescription}>
              {savingPrescription ? "Creating..." : "Create Prescription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={labOrderOpen} onOpenChange={setLabOrderOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Create Lab Order
              {clinicalAppointment
                ? ` - Appointment #${clinicalAppointment.appointmentId}`
                : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
              Lab orders can be created only during the active appointment time.
              Only one lab order is allowed for each appointment.
            </div>

            <div className="grid gap-2">
              <Label>Laboratory</Label>
              <Select
                value={laboratoryId ? String(laboratoryId) : ""}
                onValueChange={(value) => setLaboratoryId(Number(value))}
                disabled={loadingClinicalData}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingClinicalData
                        ? "Loading laboratories..."
                        : "Select laboratory"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {laboratories.map((laboratory) => (
                    <SelectItem
                      key={laboratory.laboratoryId}
                      value={String(laboratory.laboratoryId)}
                    >
                      {laboratory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Lab Tests</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setLabOrderItems((current) => [
                      ...current,
                      createLabOrderItem(),
                    ])
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add Test
                </Button>
              </div>

              {labOrderItems.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-md border p-3 md:grid-cols-[minmax(0,1fr)_120px_40px] md:items-end"
                >
                  <div className="grid gap-2">
                    <Label>Lab test</Label>
                    <Select
                      value={item.labTestId ? String(item.labTestId) : ""}
                      onValueChange={(value) =>
                        updateLabOrderItem(index, {
                          labTestId: Number(value),
                        })
                      }
                      disabled={loadingClinicalData}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingClinicalData ? "Loading..." : "Select test"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {labTests.map((test) => (
                          <SelectItem key={test.id} value={String(test.id)}>
                            {test.testName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity || ""}
                      onChange={(event) =>
                        updateLabOrderItem(index, {
                          quantity: Number(event.target.value),
                        })
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setLabOrderItems((current) =>
                        current.length === 1
                          ? current
                          : current.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                      )
                    }
                    disabled={labOrderItems.length === 1}
                    aria-label="Remove lab test"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLabOrderOpen(false)}
              disabled={savingLabOrder}
            >
              Cancel
            </Button>
            <Button
              onClick={saveLabOrder}
              disabled={savingLabOrder || loadingClinicalData}
            >
              {savingLabOrder ? "Creating..." : "Create Lab Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
