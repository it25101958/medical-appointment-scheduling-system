import Link from "next/link";

import { Button } from "@/components/ui/button";

interface AppointmentEditorPageProps {
  params: Promise<{
    appointmentId: string;
  }>;
}

export default async function AppointmentEditorPage({
  params,
}: AppointmentEditorPageProps) {
  const { appointmentId } = await params;
  const isNewAppointment = appointmentId === "new";

  return (
    <div className="col-start-1 col-end-14 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-normal tracking-tight">
            {isNewAppointment ? "New Appointment" : "Edit Appointment"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Appointment form fields can be connected here as the scheduling
            workflow grows.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/admin/dashboard/appointments">Back to appointments</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Appointment ID: {appointmentId}
      </div>
    </div>
  );
}
