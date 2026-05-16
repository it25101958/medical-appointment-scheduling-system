"use client";

import DashboardShell from "@/features/dashboard/components/dashboard-shell";
import { FileText, ClipboardList, FilePlus, Users, Bed } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const bentoItems = [
    {
      icon: FileText,
      title: "Billings",
      buttonText: "Manage Billing",
      action: () => router.push("/admin/billing"),
    },
    {
      icon: ClipboardList,
      title: "Laboratory",
      buttonText: "Manage Laboratory",
      action: () => router.push("/admin/laboratory"),
    },
    {
      icon: FilePlus,
      title: "Prescriptions",
      buttonText: "Manage Prescriptions",
      action: () => router.push("/admin/prescriptions"),
    },
    {
      icon: Users,
      title: "Patients",
      buttonText: "View Patients",
      action: () => router.push("/admin/Patients"),
    },
    { icon: Bed, title: "Rooms", buttonText: "Manage Rooms", action: null },
  ];

  return (
    <DashboardShell
      badgeText="Welcome Back"
      title={
        <>
          Your Dashboard <br />{" "}
          <span>Manage All Appointments & Information</span>
        </>
      }
      description="View today's appointments, manage users, and handle admin tasks all from this dashboard."
      primaryButton={{
        text: "Manage Users",
        onClick: () => router.push("/admin/manage-users"),
      }}
      secondaryButton={{
        text: "Appointments",
        onClick: () => router.push("/admin/dashboard/appointments"),
      }}
      bentoItems={bentoItems}
    />
  );
}
