"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2 } from "lucide-react";
import HeroVisual from "./hero-visual";

export default function Hero() {
  return (
    <section className="col-span-12 grid grid-cols-1 lg:grid-cols-12 pb-10 lg:pb-20 items-center py-3">
      <div className="lg:col-span-5 z-10 order-2 lg:order-1">
        <div className="space-y-2">
          <Badge variant="secondary" className="font-medium">
            ISO 9001:2015 Certified
          </Badge>
          <h2 className="main-title mb-3">
            Your Health, <br />
            <span className="">Scheduled with Ease.</span>
          </h2>
        </div>

        <p className="body-text ">
          Skip the waiting room. Connect with world-class specialists and manage
          your family&apos;s health journey all from one secure platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button className="">
            Book Appointment <Calendar className="ml-2 size-5" />
          </Button>
          <Button variant="outline" className="">
            View Services
          </Button>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground pt-8">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-500 " />
            <span className="font-medium xs:text-xs">80+ Specialists</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-500 " />
            <span className="font-medium xs:text-xs">24/7 Availability</span>
          </div>
        </div>
      </div>

      <div className="xs:hidden lg:block lg:col-span-6 lg:col-start-7 relative xs:h-[300px] sm:h-[400px] md:h-[600px]  order-1 lg:order-2">
        <HeroVisual />
      </div>
    </section>
  );
}
