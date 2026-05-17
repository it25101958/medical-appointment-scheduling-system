"use client";

import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <section className="col-start-4 col-end-10 overflow-hidden rounded-3xl border border-border p-8">
      <div className="">
        <div className="w-auto">
          <div className="mb-6 space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-semibold tracking-tight">
              Create Account
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Join our medical appointment system to book appointments and
              manage your health.
            </p>
          </div>

          <RegisterForm />

          <p className="mt-6 border-t border-border/10 pt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/portal"
              className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
