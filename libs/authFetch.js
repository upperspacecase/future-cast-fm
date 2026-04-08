"use client";

import { auth } from "@/libs/firebase";

/**
 * Fetch wrapper that includes Firebase auth token
 */
export async function authFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }

  const token = await user.getIdToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
