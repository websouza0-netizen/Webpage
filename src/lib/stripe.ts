import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) throw new Error("Missing required env var: STRIPE_SECRET_KEY");
    stripeClient = new Stripe(apiKey);
  }
  return stripeClient;
}

/** Lazily constructed so build-time page-data collection doesn't require STRIPE_SECRET_KEY. */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripeClient()[prop as keyof Stripe];
  },
});

export type Plan = "static" | "ecommerce";
export type BillingInterval = "monthly" | "annual";
export type AddonType = "email_pro" | "manutencao";

const PLAN_PRICE_ENV: Record<Plan, Record<BillingInterval, string>> = {
  static: {
    monthly: "STRIPE_PRICE_STATIC_MONTHLY",
    annual: "STRIPE_PRICE_STATIC_ANNUAL",
  },
  ecommerce: {
    monthly: "STRIPE_PRICE_ECOMMERCE_MONTHLY",
    annual: "STRIPE_PRICE_ECOMMERCE_ANNUAL",
  },
};

const ADDON_PRICE_ENV: Record<AddonType, string> = {
  email_pro: "STRIPE_PRICE_EMAIL_PRO",
  manutencao: "STRIPE_PRICE_MANUTENCAO",
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function planPriceId(plan: Plan, interval: BillingInterval): string {
  return requireEnv(PLAN_PRICE_ENV[plan][interval]);
}

export function addonPriceId(type: AddonType): string {
  return requireEnv(ADDON_PRICE_ENV[type]);
}

export function editTokenPriceId(): string {
  return requireEnv("STRIPE_PRICE_EDIT_TOKEN");
}

/** Reverse-lookup used by the webhook to recover plan/interval from a Stripe price id. */
export function planFromPriceId(priceId: string): { plan: Plan; interval: BillingInterval } | null {
  for (const plan of Object.keys(PLAN_PRICE_ENV) as Plan[]) {
    for (const interval of Object.keys(PLAN_PRICE_ENV[plan]) as BillingInterval[]) {
      if (process.env[PLAN_PRICE_ENV[plan][interval]] === priceId) {
        return { plan, interval };
      }
    }
  }
  return null;
}

export function addonTypeFromPriceId(priceId: string): AddonType | null {
  for (const type of Object.keys(ADDON_PRICE_ENV) as AddonType[]) {
    if (process.env[ADDON_PRICE_ENV[type]] === priceId) return type;
  }
  return null;
}
