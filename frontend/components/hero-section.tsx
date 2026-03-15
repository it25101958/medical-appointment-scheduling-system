import { Button } from "@/components/ui/button";
import { Badge } from "./ui/badge";
import { Calendar, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-10 lg:pb-20">
      <div className="lg:col-span-7">
        <div className="space-y-2">
          <Badge variant="secondary" className="font-medium">
            ISO 9001:2015 Certified
          </Badge>
          <h1 className="main-title">Your Health, Scheduled with Ease.</h1>
        </div>

        <p className="max-w-xl text-base md:text-xl text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mt-2.5">
          Skip the waiting room. Connect with world-class specialists and manage
          your family's health journey all from one secure platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button size="lg" className="">
            Book Appointment <Calendar className="size-5" />
          </Button>
          <Button size="lg" variant="outline" className="">
            View Services
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-5">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="size-4 text-green-500" /> 80+ Specialists
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="size-4 text-green-500" /> 24/7 Availability
          </div>
        </div>
      </div>
    </section>
  );
}
