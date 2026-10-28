export type PlanId = "starter" | "professional" | "enterprise";

export const planPricing: Record<
  PlanId,
  { monthly: number; yearly: number }
> = {
  starter: { monthly: 300, yearly: 2700 },
  professional: { monthly: 600, yearly: 5400 },
  enterprise: { monthly: 900, yearly: 8100 },
};
