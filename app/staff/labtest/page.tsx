"use client";

import { LabTestManagement } from "@/features/labtest";

export default function StaffLabTestsPage() {
  return (
    <LabTestManagement
      title="Lab Tests"
      description="Review available lab test records and inspect details. Administrative actions are restricted on this screen."
      canManage={false}
    />
  );
}
