import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function PatientLoginPage() {
  return (
    <div className="col-span-full lg:col-start-3 lg:col-span-8 flex flex-col lg:flex-row items-stretch justify-center gap-4 min-h-[30vh]">
      <div className="hidden lg:flex flex-1 relative rounded-3xl bg-primary/5 border border-border/60 overflow-hidden">
        <div className="relative h-full w-full">
          <Image
            src="/login.png"
            alt="Patient login"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      </div>

      <div className="flex-1 w-full flex flex-col justify-center rounded-3xl border border-border/60 bg-card/50 p-8 shadow-sm md:p-10">
        <div className="mb-6 flex flex-col space-y-2 text-center lg:text-left">
          <h1 className="text-3xl font-bold tracking-tight">Patient Login</h1>
          <p className="text-sm text-muted-foreground">
            Access your appointments, feedback, prescriptions, and records.
          </p>
        </div>

        <LoginForm audience="patient" />

        <div className="mt-6 space-y-3 border-t border-border/10 pt-4 text-center text-sm text-muted-foreground">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              Register Now
            </Link>
          </p>
          <p>
            Staff, doctor, or admin?{" "}
            <Link
              href="/portal"
              className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              Use Portal Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
