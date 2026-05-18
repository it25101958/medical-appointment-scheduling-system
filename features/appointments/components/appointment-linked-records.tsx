// src/features/appointments/components/appointment-linked-records.tsx

"use client";

import { useEffect, useState } from "react";
import { FlaskConical, ReceiptText, ScrollText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";
import { labOrderApi } from "@/features/lab-orders/api/lab-order.api";
import { LabOrderDetailsDialog } from "@/features/lab-orders/components/lab-order-details-dialog";
import type { LabOrderResponse } from "@/features/lab-orders/types/lab-order.types";
import { PrescriptionDetailsDialog } from "@/features/admin/components/prescription-details-dialog";
import type { PrescriptionResponse } from "@/types/prescription-types";

interface Props {
  appointmentId: number;
  refreshKey?: number;
}

interface PrescriptionsPage {
  content: PrescriptionResponse[];
}

export function AppointmentLinkedRecords({
  appointmentId,
  refreshKey = 0,
}: Props) {
  const [prescription, setPrescription] = useState<PrescriptionResponse | null>(
    null,
  );
  const [labOrders, setLabOrders] = useState<LabOrderResponse[]>([]);
  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionResponse | null>(null);
  const [selectedLabOrder, setSelectedLabOrder] =
    useState<LabOrderResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadLinkedRecords() {
      setLoading(true);
      try {
        const [prescriptionsPage, orders] = await Promise.all([
          apiRequest<PrescriptionsPage>("/prescription/my?page=0&size=100", {
            method: "GET",
            cache: "no-store",
          }).catch(() => ({ content: [] })),
          labOrderApi.search().catch(() => []),
        ]);

        setPrescription(
          (prescriptionsPage.content || []).find(
            (item) => Number(item.appointmentId) === Number(appointmentId),
          ) || null,
        );
        setLabOrders(
          (orders || []).filter(
            (order) => Number(order.appointmentId) === Number(appointmentId),
          ),
        );
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not load linked records"));
      } finally {
        setLoading(false);
      }
    }

    loadLinkedRecords();
  }, [appointmentId, refreshKey]);

  return (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <LinkedCard
          icon={<ScrollText className="h-4 w-4" />}
          title="Prescription"
          description={
            prescription
              ? `Prescription ${prescription.prescriptionId} - ${prescription.status}`
              : loading
                ? "Loading prescription..."
                : "No prescription added yet."
          }
          action={
            prescription ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedPrescription(prescription)}
              >
                View Details
              </Button>
            ) : null
          }
        />

        <LinkedCard
          icon={<ReceiptText className="h-4 w-4" />}
          title="Billing"
          description="View billing records connected to this appointment."
        />

        <LinkedCard
          icon={<FlaskConical className="h-4 w-4" />}
          title="Lab Orders"
          description={
            labOrders.length > 0
              ? `${labOrders.length} lab order${labOrders.length === 1 ? "" : "s"} added.`
              : loading
                ? "Loading lab orders..."
                : "No lab orders added yet."
          }
          action={
            labOrders.length > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setSelectedLabOrder(labOrders[0])}
              >
                View Details
              </Button>
            ) : null
          }
        />
      </div>

      <PrescriptionDetailsDialog
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />

      <LabOrderDetailsDialog
        labOrder={selectedLabOrder}
        labOrders={labOrders}
        onSelectLabOrder={(order) => setSelectedLabOrder(order)}
        onClose={() => setSelectedLabOrder(null)}
      />
    </>
  );
}

function LinkedCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm">
        {icon}
        {title}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
