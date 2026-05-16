"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Stethoscope,
  Send,
  Loader2,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field";

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function Footer() {
  const form = useForm({
    defaultValues: { email: "" },
    validators: {
      onSubmit: newsletterSchema,
    },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Welcome aboard!", {
        description: "You've been subscribed to our newsletter.",
      });
      form.reset();
    },
  });

  return (
    <footer className="col-span-12 border-t my-10 sm:my-5 border-border bg-background">
      <div className="grid grid-cols-12 gap-y-12 xs:pt-10 md:pt-10 lg:gap-x-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            HealthFlow
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Revolutionizing healthcare scheduling with modern, reliable
            technology.
          </p>
          <div className="flex gap-2">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <Button
                key={i}
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-md opacity-70 hover:opacity-100"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        <div className="col-span-6 md:col-span-3 lg:col-span-2 space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Product</h4>
          <nav className="flex flex-col gap-2.5">
            {["Appointments", "Telehealth", "Clinics", "Pricing"].map(
              (link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div className="col-span-6 md:col-span-3 lg:col-span-2 space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Legal</h4>
          <nav className="flex flex-col gap-2.5">
            {["Privacy", "Terms", "HIPAA", "Security"].map((link) => (
              <Link
                key={link}
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link}
              </Link>
            ))}
          </nav>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-4 space-y-4">
          <h4 className="text-sm font-semibold text-foreground">
            Stay Updated
          </h4>
          <p className="text-sm text-muted-foreground">
            Get health insights and platform updates directly in your inbox.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="w-full max-w-sm"
          >
            <form.Field
              name="email"
              validators={{ onChange: newsletterSchema.shape.email }}
            >
              {(field) => (
                <FieldGroup className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id={field.name}
                      placeholder="name@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`h-10 bg-muted/30 border-border shadow-none focus-visible:ring-1 ${
                        field.state.meta.errors.length
                          ? "border-destructive"
                          : ""
                      }`}
                    />
                    <form.Subscribe
                      selector={(state) => [
                        state.canSubmit,
                        state.isSubmitting,
                      ]}
                    >
                      {([canSubmit, isSubmitting]) => (
                        <Button
                          type="submit"
                          disabled={!canSubmit || isSubmitting}
                          className="h-10 px-3 font-semibold shadow-sm"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </form.Subscribe>
                  </div>
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched && (
                      <p className="text-[10px] text-destructive font-medium px-1">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                </FieldGroup>
              )}
            </form.Field>
          </form>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between py-8 gap-4 text-xs text-muted-foreground/60">
        <p>© 2026 HealthFlow Inc. Built with care for patients.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-foreground transition-colors">
            Status
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Sitemap
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
