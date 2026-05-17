"use server";

import { apiRequest } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";

interface VerifyValues {
  email: string;
  code: string;
}

interface ResendValues {
  email: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  nic: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  allergies?: string;
}

export async function registerAction(payload: RegisterPayload) {
  try {
    const response = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    return {
      success: true,
      message:
        "Registration successful. Please check your email for the verification code.",
      data: response,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function verifyAccountAction(values: VerifyValues) {
  try {
    await apiRequest("/auth/verify", {
      method: "POST",
      body: JSON.stringify(values),
    });

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function resendVerificationAction(values: ResendValues) {
  try {
    await apiRequest("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(values),
    });

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
