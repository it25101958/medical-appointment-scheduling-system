"use client";

import { LabTestManagement } from "@/features/labtest";

export default function AdminLabTestsPage() {
  return (
    <LabTestManagement
      title="Lab Test Management"
      description="Create, update, review, and remove laboratory test records used by the clinical workflow."
      canManage
    />
  );
}
