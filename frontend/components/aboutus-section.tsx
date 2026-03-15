import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, BedDouble, Users2, Stethoscope } from "lucide-react";

const stats = [
  { label: "Daily Tests", value: "1,200+", icon: FlaskConical },
  { label: "Luxury Rooms", value: "150+", icon: BedDouble },
  { label: "Specialists", value: "80+", icon: Stethoscope },
  { label: "Expert Doctors", value: "200+", icon: Users2 },
];

export default function WhyChoiceUs() {
  return (
    <section className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pb-10 lg:pb-20">
      <div className="lg:col-span-5 order-2 lg:order-1">
        <div className="relative aspect-[4/5] w-full rounded-[40px] md:rounded-[60px] overflow-hidden border border-border ">
          <Image
            src="/interior-design.png"
            alt="Modern Hospital Interior"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary" className="font-medium">
            Why Choose Our Hospital
          </Badge>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Advanced Healthcare <br />
            <span className="text-muted-foreground font-light">
              Tailored to Your Needs.
            </span>
          </h2>
          <p className="body-text">
            Our hospital combines cutting-edge technology with a compassionate
            approach to patient care. From rapid diagnostic testing to
            comfortable inpatient recovery, we ensure your health journey is
            managed by world-class consultants.
          </p>
        </div>

        <div className="xs:grid xs:grid-cols-2 lg:grid-cols-4 pt-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2 group">
              <div className="size-10 rounded-xl bg-secondary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground xs:space-y-2">
                <stat.icon className="size-5" />
              </div>
              <div className="xs:space-y-1 sm:space-y-0">
                <h4 className="sm:text-xl xs:text-sm font-bold">
                  {stat.value}
                </h4>
                <p className="xs:text-xs sm:text-sm text-muted-foreground tracking-wider font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <p className="xs:text-xs sm:text-sm font-medium text-primary underline underline-offset-4 cursor-pointer hover:opacity-80 transition-opacity">
            Learn more about our specializations →
          </p>
        </div>
      </div>
    </section>
  );
}
