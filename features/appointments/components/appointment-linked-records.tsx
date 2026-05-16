// src/features/appointments/components/appointment-linked-records.tsx

"use client";

import { FlaskConical, ReceiptText, ScrollText } from "lucide-react";

interface Props {
  appointmentId: number;
}

export function AppointmentLinkedRecords({ appointmentId }: Props) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <LinkedCard
        icon={<ScrollText className="h-4 w-4" />}
        title="Prescription"
        description="View or create prescription connected to this appointment."
      />

      <LinkedCard
        icon={<ReceiptText className="h-4 w-4" />}
        title="Billing"
        description="View billing records connected to this appointment."
      />

      <LinkedCard
        icon={<FlaskConical className="h-4 w-4" />}
        title="Lab Orders"
        description="View lab orders connected to this appointment."
      />
    </div>
  );
}

function LinkedCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm">
        {icon}
        {title}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}
