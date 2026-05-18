"use client";

import { PaymentManagement } from "@/features/payment";

export default function StaffPaymentPage() {
  return (
    <PaymentManagement
      title="Payments"
      description="Create and update payment records for patient appointments."
      canManage
      canDelete={false}
    />
  );
}
