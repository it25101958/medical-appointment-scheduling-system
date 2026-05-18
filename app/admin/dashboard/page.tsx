"use client";

import { DashboardShell } from "@/features/dashboard";
import {
  FileText,
  ClipboardList,
  FilePlus,
  Pill,
  Users,
  Bed,
  Calendar,
  FlaskConical,
  CreditCard,
} from "lucide-react";
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
      icon: CreditCard,
      title: "Payments",
      buttonText: "Manage Payments",
      action: () => router.push("/admin/payment"),
    },
    {
      icon: ClipboardList,
      title: "Laboratory",
      buttonText: "Manage Laboratory",
      action: () => router.push("/admin/laboratory"),
    },
    {
      icon: FlaskConical,
      title: "Lab Tests",
      buttonText: "Manage Lab Tests",
      action: () => router.push("/admin/labtest"),
    },
    {
      icon: FilePlus,
      title: "Prescriptions",
      buttonText: "Manage Prescriptions",
      action: () => router.push("/admin/prescriptions"),
    },
    {
      icon: Pill,
      title: "Medications",
      buttonText: "Manage Medications",
      action: () => router.push("/admin/medications"),
    },
    {
      icon: Users,
      title: "Patients",
      buttonText: "View Patients",
      action: () => router.push("/admin/Patients"),
    },
    {
      icon: Bed,
      title: "Rooms",
      buttonText: "Manage Rooms",
      action: () => router.push("/admin/rooms"),
    },
    {
      icon: Calendar,
      title: "Room Schedules",
      buttonText: "Schedule Rooms",
      action: () => router.push("/admin/room-schedule"),
    },
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
