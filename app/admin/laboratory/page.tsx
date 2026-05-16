"use client";

import { LaboratoryManagement } from "@/features/laboratory";

export default function AdminLaboratoryPage() {
  return (
    <LaboratoryManagement
      title="Laboratory Management"
      description="Create, update, review, and remove laboratory records used across the appointment system."
      canManage
    />
  );
}
