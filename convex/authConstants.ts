export const clerkIssuerDomain = "https://perfect-marmoset-29.clerk.accounts.dev";

export function clerkTokenIdentifier(clerkUserId: string) {
  return `${clerkIssuerDomain}|${clerkUserId}`;
}
