import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid medical ID or email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const commonUserSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .nonempty("Email is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .nonempty("Password is required."),
  first_name: z
    .string()
    .min(3, "First Name must be at least 3 characters.")
    .nonempty("First Name is required."),
  last_name: z
    .string()
    .min(3, "Last Name must be at least 3 characters.")
    .nonempty("Last Name is required."),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits.")
    .nonempty("Phone number is required."),
  NIC: z.string().nonempty("National Identity Card is required."),
  date_of_birth: z.string().nonempty("Date of birth is required."),
  gender: z
    .enum(["male", "female", "other"])
    .refine((val) => ["male", "female", "other"].includes(val), {
      message: "Gender must be male, female, or other.",
    }),
  address: z.string().nonempty("Address is required."),
  is_active: z.boolean().default(true),
});

const doctorSchema = z.object({
  user_id: z
    .number()
    .int()
    .positive()
    .nonnegative("User ID must be a valid number."),
  specialization: z
    .string()
    .min(3, "Specialization must be at least 3 characters.")
    .nonempty("Specialization is required."),
  license_number: z
    .string()
    .min(5, "License number must be at least 5 characters.")
    .nonempty("License number is required."),
  qualification: z
    .string()
    .min(5, "Qualification must be at least 5 characters.")
    .nonempty("Qualification is required."),
  experience_years: z
    .number()
    .int()
    .positive()
    .min(0, "Experience years must be greater than or equal to 0."),
  consultation_fee: z
    .number()
    .positive()
    .min(0, "Consultation fee must be a positive number."),
});

const adminSchema = z.object({
  user_id: z
    .number()
    .int()
    .positive()
    .nonnegative("User ID must be a valid number."),
  department: z.string().nonempty("Department is required."),
  access_level: z
    .enum(["full", "limited"])
    .refine((val) => ["full", "limited"].includes(val), {
      message: "Access level must be either 'full' or 'limited'.",
    }),
});

const staffSchema = z.object({
  user_id: z
    .number()
    .int()
    .positive()
    .nonnegative("User ID must be a valid number."),
  role: z.string().min(3, "Role must be at least 3 characters."),
  contact_info: z.string().optional(),
  working_hours: z.string().optional(),
  status: z
    .enum(["active", "on-leave", "inactive"])
    .refine((val) => ["active", "on-leave", "inactive"].includes(val), {
      message: "Status must be 'active', 'on-leave', or 'inactive'.",
    }),
  specialization: z.string().optional(),
});

const roleTypeSchema = z
  .enum(["patient", "doctor", "admin"])
  .refine((val) => ["patient", "doctor", "admin"].includes(val), {
    message:
      "Role type must be one of the following: 'patient', 'doctor', or 'admin'.",
  });

export const userRegistrationSchema = commonUserSchema.extend({
  role_type: roleTypeSchema,
});

export const doctorRegistrationSchema = userRegistrationSchema.extend({
  role_type: z.literal("doctor"),
  doctor_details: doctorSchema,
});

export const adminRegistrationSchema = userRegistrationSchema.extend({
  role_type: z.literal("admin"),
  admin_details: adminSchema,
});

export const staffRegistrationSchema = userRegistrationSchema.extend({
  role_type: z.literal("staff"),
  staff_details: staffSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
