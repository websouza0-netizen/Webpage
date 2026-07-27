// Real EUR pricing for the two WebSouza subscription plans.

// Matches the live STRIPE_PRICE_EDIT_TOKEN price (confirmed against Stripe).
export const EXTRA_EDIT_PRICE_EUR = 2.5;

export const FREE_EDITS_PER_PERIOD = 2;

export type BillingInterval = "monthly" | "annual";

export type Plan = {
  id: "static" | "ecommerce";
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "static",
    name: "Static site",
    tagline: "A polished, fast marketing site for your business.",
    monthlyPrice: 29,
    annualPrice: 250,
    features: [
      "Custom design, not a template",
      "Up to 5 pages",
      "Hosting and SSL included",
      `${FREE_EDITS_PER_PERIOD} free edit requests per billing period`,
      "Contact forms and basic SEO",
    ],
  },
  {
    id: "ecommerce",
    name: "E-commerce site",
    tagline: "A full storefront with checkout, built to sell.",
    monthlyPrice: 39,
    annualPrice: 350,
    features: [
      "Everything in Static site",
      "Product catalog and checkout",
      "Order and inventory basics",
      `${FREE_EDITS_PER_PERIOD} free edit requests per billing period`,
      "Payment provider setup",
    ],
  },
];

export function formatEUR(amount: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function priceForInterval(plan: Plan, interval: BillingInterval) {
  return interval === "monthly" ? plan.monthlyPrice : plan.annualPrice;
}
