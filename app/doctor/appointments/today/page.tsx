import { apiRequest } from "@/lib/api-client";
import { AppointmentResponse } from "@/features/appointments/types/appointment.types";
import { TodayAppointmentsList } from "./today-appointments-list";

function getTodayInSriLanka() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export default async function DoctorTodayAppointmentsPage() {
  const appointments = await apiRequest("/appointment", {
    method: "GET",
    cache: "no-store",
  });

  const today = getTodayInSriLanka();

  const todayAppointments = (appointments as AppointmentResponse[])
    .filter((appointment) => appointment.appointmentDate === today)
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

  return (
    <div className="space-y-6 col-start-1 col-end-14">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Doctor Portal</p>
        <h1 className="text-2xl font-medium tracking-tight">
          Today&apos;s Appointments
        </h1>
        <p className="text-sm text-muted-foreground">
          Review your consultation schedule for {today}.
        </p>
      </div>

      <TodayAppointmentsList appointments={todayAppointments} />
    </div>
  );
}
