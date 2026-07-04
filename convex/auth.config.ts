import type { AuthConfig } from "convex/server";
import { clerkIssuerDomain } from "./authConstants";

export default {
  providers: [
    {
      domain: clerkIssuerDomain,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
