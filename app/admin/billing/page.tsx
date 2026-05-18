"use client";

import { BillingManagement } from "@/features/billing";

export default function AdminBillingPage() {
  return (
    <BillingManagement
      title="Billing Management"
      description="Create, update, review, and remove patient billing records."
      canManage
    />
  );
}
