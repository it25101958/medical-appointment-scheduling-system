"use client";

import DashboardShell from "@/features/dashboard/components/dashboard-shell";
import {
  Calendar,
  Users,
  Bed,
  ClipboardList,
  FileText,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function StaffDashboard() {
  const router = useRouter();

  // Staff-specific Bento items (Operational Focus)
  const staffItems = [
    {
      icon: Calendar,
      title: "Appointments",
      buttonText: "Manage Schedule",
      action: () => router.push("/staff/appointments"),
    },
    {
      icon: Users,
      title: "Patient Registry",
      buttonText: "View Patients",
      action: () => router.push("/staff/patients"),
    },
    {
      icon: Bed,
      title: "Room Status",
      buttonText: "Check Beds",
      action: () => router.push("/staff/rooms"),
    },
    {
      icon: ClipboardList,
      title: "Lab Orders",
      buttonText: "Process Lab",
      action: () => router.push("/staff/laboratory"),
    },
    {
      icon: FileText,
      title: "Billing Docs",
      buttonText: "Draft Invoice",
      action: () => router.push("/staff/billing"),
    },
    {
      icon: Clock,
      title: "Shift Roster",
      buttonText: "My Shifts",
      action: () => router.push("/staff/shifts"),
    },
  ];

  return (
    <DashboardShell
      badgeText="Staff Operations Portal"
      title={
        <>
          Operations Desk <br />
          <span>Hospital Management & Logistics</span>
        </>
      }
      description="Manage the daily flow of patients, coordinate room availability, and ensure laboratory and billing records are up to date."
      primaryButton={{
        text: "Today's Schedule",
        onClick: () => router.push("/staff/appointments/today"),
      }}
      secondaryButton={{
        text: "Register New Patient",
        onClick: () => router.push("/staff/patients/new"),
      }}
      bentoItems={staffItems}
    />
  );
}
