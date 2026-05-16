import Link from "next/link";
import {
  Pill,
  Calendar,
  Video,
  FlaskConical,
  Drill,
  ArrowUpRight,
  PhoneCall,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const services = [
  {
    title: "Appointments",
    href: "/appointments",
    desc: "Book a specialist doctor for in-person visits with minimal waiting time.",
    icon: Calendar,
    className: "lg:col-span-6 lg:row-span-2 bg-background border border-border",
    stats: "Next Available: Today, 2:00 PM",
    doctors: ["/d1.png", "/d2.png", "/d3.png", "/d4.png"],
  },
  {
    title: "Pharmacy",
    href: "/pharmacy",
    desc: "Order medicines online with home delivery.",
    icon: Pill,
    className: "lg:col-span-6 lg:row-span-1 bg-secondary",
  },
  {
    title: "Laboratories",
    href: "/labs",
    desc: "Fast and accurate clinical test results.",
    icon: FlaskConical,
    className: "lg:col-span-3 lg:row-span-1 bg-background border border-border",
  },
  {
    title: "Consultant",
    href: "/consultant",
    desc: "Secure video consultations.",
    icon: Video,
    className: "lg:col-span-3 lg:row-span-1 bg-background border border-border",
  },
  {
    title: "Dental",
    href: "/dental",
    desc: "Complete oral health and surgery.",
    icon: Drill,
    className: "lg:col-span-6 lg:row-span-1 bg-secondary",
  },
  {
    title: "Emergency",
    href: "/contact",
    desc: "24/7 Urgent care and ambulance services.",
    icon: PhoneCall,
    className: "lg:col-span-6 bg-destructive/10 border border-destructive/20",
  },
];

export default function ServicesBento() {
  return (
    <section className="col-span-12 pb-10 lg:pb-20">
      <div className="space-y-3 mb-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Our Services
        </h2>
        <p className="body-text text-sm md:text-lg max-w-xl">
          Comprehensive healthcare solutions designed for your convenience and
          well-being.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:row-span-2 gap-4">
        {services.map((service) => {
          const isAppointments = service.title === "Appointments";

          return (
            <Link
              key={service.title}
              href={service.href}
              className={cn(
                "group relative overflow-hidden rounded-3xl p-6 lg:p-8 transition-all duration-500",
                "border border-border/50 hover:border-primary/50",
                service.className,
              )}
            >
              <div className="relative z-20 flex h-full flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex p-3 rounded-2xl transition-all bg-primary/10 text-primary">
                    <service.icon className="size-6" />
                  </div>

                  <div className="max-w-[90%]">
                    <h2 className="main-title text-lg mb-2 text-foreground">
                      {service.title}
                    </h2>
                    <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </div>

                {isAppointments && (
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {service.doctors?.map((src, i) => (
                          <div
                            key={i}
                            className="size-10 rounded-full border-2 border-background bg-muted overflow-hidden relative shadow-sm"
                          >
                            <Image
                              src={src}
                              alt="Doctor"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        +12 Doctors Online
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20 w-fit">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-[10px] font-black tracking-widest text-green-600 dark:text-green-400">
                        AVAILABLE NOW
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <ArrowUpRight
                className={cn(
                  "absolute top-8 right-8 size-6 z-20 transition-all text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1",
                )}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
