import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <>
      {/* CENTRAL GROUP: 
          lg:col-start-3 + lg:col-span-8 centers the group (2 columns left, 2 columns right).
          items-stretch makes the image box the same height as the form.
      */}
      <div className="col-span-full lg:col-start-3 lg:col-span-8 flex flex-col lg:flex-row items-stretch justify-center gap-4 min-h-[30vh]">
        {/* LEFT COMPONENT: Image Box 
            flex-1 ensures it takes exactly 50% of the parent width.
        */}
        <div className="hidden lg:flex flex-1 relative rounded-3xl bg-primary/5 border border-border/60 overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src="/login.png"
              alt="Healthcare portal"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Overlay to soften the image and match the theme */}
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        </div>

        {/* RIGHT COMPONENT: Login Form 
            flex-1 ensures it takes exactly 50% of the parent width.
        */}
        <div className="flex-1 w-full flex flex-col justify-center p-8 md:p-10 rounded-3xl border border-border/60 bg-card/50 shadow-sm">
          <div className="flex flex-col space-y-2 text-center lg:text-left mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Please enter your medical ID or email address to continue.
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted-foreground pt-4 border-t border-border/10 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
            >
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
