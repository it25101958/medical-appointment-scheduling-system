"use client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { contactSchema } from "@/lib/validations/contact";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export default function ContactSection() {
  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      subject: "",
      message: "",
    },
    validators: {
      onSubmit: contactSchema,
    },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Success", {
        description: "Your message has been received.",
      });
      form.reset();
    },
  });

  return (
    <section className="col-span-12 grid grid-cols-12">
      <div className="col-span-12 lg:col-span-8 flex flex-col justify-start space-y-12">
        <div className="space-y-4">
          <h2 className="main-title">Get in touch</h2>
          <p className="body-text">
            Have questions? Our team is here to help you navigate our services.
          </p>
        </div>

        <div className="space-y-6">
          {[
            { Icon: Mail, label: "Email", val: "support@healthflow.com" },
            { Icon: Phone, label: "Phone", val: "+1 (555) 000-1234" },
            { Icon: MapPin, label: "Office", val: "123 Health Ave, NY" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background shadow-sm">
                <item.Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="text-sm text-muted-foreground">{item.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="col-span-12 lg:col-span-4"
      >
        <div className="rounded-xl lg:border lg:border-border lg:bg-card text-card-foreground xs:mt-10 lg:mt-0">
          <div className="lg:p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <form.Field
                  name="fullName"
                  validators={{ onChange: contactSchema.shape.fullName }}
                >
                  {(field) => {
                    const isInvalid =
                      !!field.state.meta.errors.length &&
                      field.state.meta.isTouched;
                    return (
                      <Field data-invalid={isInvalid} className="">
                        <FieldLabel htmlFor={field.name} className="">
                          Full Name
                        </FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="John Doe"
                          className="bg-transparent"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
                <form.Field
                  name="email"
                  validators={{ onChange: contactSchema.shape.email }}
                >
                  {(field) => {
                    const isInvalid =
                      !!field.state.meta.errors.length &&
                      field.state.meta.isTouched;
                    return (
                      <Field data-invalid={isInvalid} className="">
                        <FieldLabel htmlFor={field.name} className="">
                          Email Address
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="john@example.com"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field
                  name="subject"
                  validators={{ onChange: contactSchema.shape.subject }}
                >
                  {(field) => (
                    <Field className="col-span-1 md:col-span-2 ">
                      <FieldLabel htmlFor={field.name} className="">
                        Subject
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Inquiry"
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field
                  name="message"
                  validators={{ onChange: contactSchema.shape.message }}
                >
                  {(field) => {
                    const isInvalid =
                      !!field.state.meta.errors.length &&
                      field.state.meta.isTouched;
                    return (
                      <Field
                        data-invalid={isInvalid}
                        className="col-span-1 md:col-span-2 "
                      >
                        <FieldLabel htmlFor={field.name} className="">
                          Message
                        </FieldLabel>
                        <Textarea
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Tell us what you need help with..."
                          className="min-h-[120px] resize-none"
                        />
                        <div className="flex justify-between items-center">
                          <div className="min-h-[1.25rem]">
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {field.state.value.length}/500
                          </span>
                        </div>
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className="col-span-1 md:col-span-2 w-full font-semibold"
                    >
                      {isSubmitting ? "Sending..." : "Submit Inquiry"}
                      {isSubmitting ? (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  )}
                </form.Subscribe>
              </FieldGroup>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
