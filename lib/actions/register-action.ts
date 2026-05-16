"use server";

import { apiRequest } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";

interface RegisterValues {
  role: string;
  [key: string]: unknown;
}

export async function registerAction(values: RegisterValues) {
  try {
    const endpoint = `/auth/register/${values.role.toLowerCase()}`;

    await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(values),
    });

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
