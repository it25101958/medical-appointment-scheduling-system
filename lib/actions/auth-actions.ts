"use server";

import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";

export async function loginAction(values: any) {
  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(values),
    });
    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return { success: true };
  } catch (error: any) {
    console.log(error);
    return { success: false, error: error.message };
  }
}
