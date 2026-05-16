"use client";

import DashboardShell from "@/features/dashboard/components/dashboard-shell";
import {
  CalendarPlus,
  FileText,
  ClipboardList,
  CreditCard,
  History,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PatientDashboard() {
  const router = useRouter();
  const patientItems = [
    {
      icon: CalendarPlus,
      title: "Appointment",
      buttonText: "Schedule Now",
      action: () => router.push("/patient/book"),
    },
    {
      icon: FileText,
      title: "My Prescriptions",
      buttonText: "View Current",
      action: () => router.push("/patient/prescriptions"),
    },
    {
      icon: ClipboardList,
      title: "Lab Results",
      buttonText: "Check Status",
      action: () => router.push("/patient/results"),
    },
    {
      icon: CreditCard,
      title: "Medical Billing",
      buttonText: "Pay Invoices",
      action: () => router.push("/patient/billing"),
    },
    {
      icon: History,
      title: "Medical History",
      buttonText: "View Records",
      action: () => router.push("/patient/history"),
    },
    {
      icon: UserCircle,
      title: "Profile Settings",
      buttonText: "Update Info",
      action: () => router.push("/patient/profile"),
    },
  ];

  return (
    <DashboardShell
      badgeText="Patient Care Portal"
      title={
        <>
          Your Health Center <br />
          <span>Manage Appointments & Records</span>
        </>
      }
      description="Stay on top of your health. Book new appointments, pay your medical bills, and access your lab results securely."
      primaryButton={{
        text: "Book Appointment",
        onClick: () => router.push("/patient/book"),
      }}
      secondaryButton={{
        text: "View My Visits",
        onClick: () => router.push("/patient/appointments"),
      }}
      bentoItems={patientItems}
    />
  );
}
