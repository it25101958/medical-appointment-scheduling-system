"use client";

import { BillingManagement } from "@/features/billing";

export default function StaffBillingPage() {
  return (
    <BillingManagement
      title="Billing"
      description="Create and manage patient billing records for appointments."
      canManage
    />
  );
}
