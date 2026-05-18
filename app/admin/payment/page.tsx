"use client";

import { PaymentManagement } from "@/features/payment";

export default function AdminPaymentPage() {
  return (
    <PaymentManagement
      title="Payment Management"
      description="Create, update, review, and delete payment records."
      canManage
      canDelete
    />
  );
}
