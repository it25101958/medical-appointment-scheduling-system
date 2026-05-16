import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div
      className={cn(
        "col-span-4",
        "lg:col-start-2 lg:col-span-10",
        "flex flex-col items-start justify-center min-h-[70vh] gap-6",
      )}
    >
      <div className="space-y-4">
        <span className="form-label text-primary">Error 404</span>

        <h1 className="main-title text-6xl md:text-8xl">
          Page <span className="span-title">not found.</span>
        </h1>

        <p className="body-text max-w-xl">
          The medical resource or page you are looking for isn&apos;t here. Please
          check the URL or return to the dashboard.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button asChild variant="default" className="">
          <Link href="/">Go to Home</Link>
        </Button>

        <Button asChild variant="ghost" className="">
          <Link href="/support">Contact Support</Link>
        </Button>
      </div>
      <div
        className="absolute -z-10 top-1/2 right-10 w-64 h-64 bg-[var(--chart-1)] opacity-10 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
