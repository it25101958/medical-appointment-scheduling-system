"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BillingManagement } from "@/features/billing";
import { apiRequest } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";

interface CurrentUser {
  userId: number;
  firstName?: string;
  lastName?: string;
}

export default function PatientBillingPage() {
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
      <div className="col-start-1 col-end-14 p-4 text-sm text-muted-foreground">
        Loading billing records...
      </div>
    );
  }

  return (
    <BillingManagement
      title="My Billing"
      description="Review billing records connected to your appointments."
      canManage={false}
      patientId={patient?.userId}
    />
  );
}
