import * as z from "zod";

export const labOrderItemSchema = z.object({
  labTestId: z.coerce.number().min(1, "Lab test is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const labOrderSchema = z.object({
  appointmentId: z.coerce.number().min(1, "Appointment is required"),
  laboratoryId: z.coerce.number().min(1, "Laboratory is required"),
  items: z.array(labOrderItemSchema).min(1, "Add at least one lab test"),
});

export type LabOrderValues = z.infer<typeof labOrderSchema>;
export type LabOrderItemValues = z.infer<typeof labOrderItemSchema>;
