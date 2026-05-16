"use server";
import { cookies } from "next/headers";

const BASE_URL = process.env.INTERNAL_BACKEND_URL;

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log(errorData);
    throw new Error(errorData.message || "Something went wrong");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
