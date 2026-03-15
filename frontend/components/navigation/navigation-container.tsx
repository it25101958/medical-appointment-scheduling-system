"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  HeartPulse,
  Menu,
  Pill,
  Calendar,
  Video,
  FlaskConical,
  Drill,
  PhoneCall,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
  NavigationMenuContent,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const services = [
  {
    title: "Pharmacy",
    href: "/pharmacy",
    desc: "Order medicines online.",
    icon: Pill,
  },
  {
    title: "Appointments",
    href: "/appointments",
    desc: "Book a specialist.",
    icon: Calendar,
  },
  {
    title: "Consultant",
    href: "/consultant",
    desc: "Video consultations.",
    icon: Video,
  },
  {
    title: "Laboratories",
    href: "/labs",
    desc: "View test results.",
    icon: FlaskConical,
  },
  {
    title: "Dental",
    href: "/dental",
    desc: "Oral care services.",
    icon: Drill,
  },
  {
    title: "Emergency",
    href: "/contact",
    desc: "24/7 Urgent care and ambulance services.",
    icon: PhoneCall,
    className: "lg:col-span-6 bg-destructive/10 border border-destructive/20",
  },
];

const NavigationContainer = () => {
  return (
    <header className="col-span-full flex items-center justify-between w-full">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <HeartPulse className="size-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Med<span className="text-primary">Care</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search doctors or services..."
            className="pl-9 w-full bg-muted/50 border-none focus-visible:ring-1"
          />
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
              >
                <Link href="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
              >
                <Link href="/doctors">Find a Doctor</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">
                Services
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                  {services.map((service) => (
                    <li key={service.title}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={service.href}
                          className="flex items-start gap-4 select-none rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-primary/5 group"
                        >
                          <div className=" flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                            <service.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-semibold leading-none group-hover:text-primary">
                              {service.title}
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground/80">
                              {service.desc}
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
              >
                <Link href="/contact">Contact</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          {/* <Link href="/auth/login" passHref>
            <Button
              variant="outline"
              className="hidden sm:inline-flex font-medium"
            >
              Login
            </Button>
          </Link> */}
          <ThemeToggle />
          <Link href="/payment/online-payment" passHref>
            <Button
              variant="default"
              className="hidden sm:inline-flex font-medium"
            >
              Online Payment
            </Button>
          </Link>
          {/* <Button className="font-medium">Register</Button> */}
        </div>
      </div>
      <div className="flex items-center md:hidden">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-3">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="flex items-center gap-2">
                <HeartPulse className="size-5 text-primary" /> MedCare
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6">
              <nav className="flex flex-col gap-2">
                <Link
                  href="/doctors"
                  className="p-3 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                >
                  Find a Doctor
                </Link>
                <Link
                  href="/services"
                  className="p-3 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="/contact"
                  className="p-3 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                >
                  Contact
                </Link>
              </nav>
              <Button className="">Book Appointment</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default NavigationContainer;
