"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui";
import { PaymentManagement } from "@/features/payment";
import { apiRequest } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";

interface CurrentUser {
  userId: number;
  firstName?: string;
  lastName?: string;
}

export default function PatientPaymentPage() {
  const [patient, setPatient] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatient() {
      try {
        const currentUser = await apiRequest<CurrentUser>("/users/me", {
          method: "GET",
          cache: "no-store",
        });
        setPatient(currentUser);
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not load patient profile"));
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, []);

  if (loading) {
    return (
      <div className="col-start-1 col-end-14 space-y-6">
        <PageHeader
          title="My Payments"
          description="Review and create payments connected to your appointments."
        />
        <div className="rounded-lg border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          Loading payment records...
        </div>
      </div>
    );
  }

  return (
    <PaymentManagement
      title="My Payments"
      description="Review and create payments connected to your appointments."
      canManage
      canDelete={false}
      patientId={patient?.userId}
    />
  );
}
