"use client";

import DashboardShell from "@/components/dashboard/dashboard-shell";
import {
  Calendar,
  Users,
  Stethoscope,
  ClipboardList,
  FilePlus,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DoctorDashboard() {
  const router = useRouter();

  // Doctor-specific Bento items
  const doctorItems = [
    {
      icon: Calendar,
      title: "My Schedule",
      buttonText: "View Calendar",
      action: () => router.push("/doctor/schedule"),
    },
    {
      icon: Users,
      title: "Patient Records",
      buttonText: "Search Patients",
      action: () => router.push("/doctor/patients"),
    },
    {
      icon: Stethoscope,
      title: "Consultations",
      buttonText: "Start Session",
      action: () => router.push("/doctor/consults"),
    },
    {
      icon: FilePlus,
      title: "Prescriptions",
      buttonText: "Issue New",
      action: () => router.push("/doctor/prescriptions/new"),
    },
    {
      icon: Activity,
      title: "Health Vitals",
      buttonText: "Review Trends",
      action: () => router.push("/doctor/vitals"),
    },
    {
      icon: ClipboardList,
      title: "Lab Reports",
      buttonText: "View Results",
      action: () => router.push("/doctor/lab-results"),
    },
  ];

  return (
    <DashboardShell
      badgeText="Medical Professional Portal"
      title={
        <>
          Doctor's Console <br />
          <span>Clinical Overview & Patient Care</span>
        </>
      }
      description="Access your daily consultation list, manage patient histories, and issue prescriptions all in one place."
      primaryButton={{
        text: "Today's Appointments",
        onClick: () => router.push("/doctor/appointments/today"),
      }}
      secondaryButton={{
        text: "Patient Queue",
        onClick: () => router.push("/doctor/queue"),
      }}
      bentoItems={doctorItems}
    />
  );
}
