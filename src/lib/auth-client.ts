"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_AUTH_URL ||
    "http://localhost:3000",
  plugins: [
    inferAdditionalFields<{
      role: string;
    }>(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = "/auth/two-factor";
      },
    }),
    organizationClient(),
  ],
});

export const { signIn, signOut, signUp, useSession, getSession, $fetch } =
  authClient;
