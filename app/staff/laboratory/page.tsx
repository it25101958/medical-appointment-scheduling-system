"use client";

import { LaboratoryManagement } from "@/features/laboratory";

export default function StaffLaboratoryPage() {
  return (
    <LaboratoryManagement
      title="Laboratory"
      description="View laboratory records and inspect their details. Administrative actions are restricted on this screen."
      canManage={false}
    />
  );
}
