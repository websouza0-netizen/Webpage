import { z } from "zod";

export const PAGE_OPTIONS = [
  "home",
  "about",
  "services",
  "menu_products",
  "contact",
  "blog",
  "booking",
] as const;

export const THEME_OPTIONS = ["minimal", "bold", "elegant", "playful", "corporate", "surprise_me"] as const;

export const PAYMENT_METHOD_OPTIONS = ["card", "paypal", "apple_pay", "google_pay", "bank_transfer"] as const;

export const briefSchema = z.object({
  brandName: z.string().min(1, "Required"),
  oneLiner: z.string().min(1, "Required"),
  longDescription: z.string().optional(),
  themePreference: z.enum(THEME_OPTIONS).optional(),
  themeNotes: z.string().optional(),
  brandColors: z.array(z.string()).max(3).optional(),
  referenceUrls: z.array(z.string().url().or(z.literal(""))).max(3).optional(),
  pagesNeeded: z.array(z.enum([...PAGE_OPTIONS, "shop"])),
  domainChoice: z.enum(["has_domain", "need_domain"]).optional(),
  domainValue: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialTiktok: z.string().optional(),
  socialExistingSite: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email(),
  ecommerceProductCount: z.number().int().nonnegative().optional(),
  ecommercePaymentMethods: z.array(z.enum(PAYMENT_METHOD_OPTIONS)).optional(),
  ecommerceShippingNeeded: z.boolean().optional(),
});

export type BriefFormValues = z.infer<typeof briefSchema>;

export type UploadedAsset = {
  path: string;
  fileName: string;
  sizeBytes: number;
  kind: "logo" | "photo";
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_TOTAL_FILES = 10;
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
