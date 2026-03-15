import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <>
      <div className="relative hidden lg:flex lg:col-span-6 overflow-hidden rounded-xl h-max lg:bg-primary xs:bg-transparent flex-col items-center justify-center">
        <div className="relative z-10 w-full aspect-square">
          <Image
            src="/login.png"
            alt="Healthcare background"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="absolute inset-0  xs:bg-transparent lg:bg-gradient-to-r from-primary via-primary/20 to-transparent z-0" />
      </div>
      <div className="col-span-full lg:col-start-8 lg:col-span-5 flex items-center justify-center">
        <div className="w-full flex flex-col justify-center space-y-6 p-8 md:p-12 rounded-xl border border-border/60 bg-card/50">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Please enter your medical ID or email address to continue.
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-muted-foreground">
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
