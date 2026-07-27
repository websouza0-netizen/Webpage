"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  briefSchema,
  type BriefFormValues,
  PAGE_OPTIONS,
  THEME_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  MAX_UPLOAD_BYTES,
  MAX_TOTAL_FILES,
} from "@/lib/onboarding-schema";
import { submitBrief } from "@/app/onboarding/actions";

const PAGE_LABELS: Record<(typeof PAGE_OPTIONS)[number] | "shop", string> = {
  home: "Home",
  about: "About",
  services: "Services",
  menu_products: "Menu / Products",
  contact: "Contact",
  blog: "Blog",
  booking: "Booking",
  shop: "Shop",
};

const THEME_LABELS: Record<(typeof THEME_OPTIONS)[number], string> = {
  minimal: "Minimal",
  bold: "Bold & colorful",
  elegant: "Elegant",
  playful: "Playful",
  corporate: "Corporate",
  surprise_me: "Surprise me",
};

const PAYMENT_LABELS: Record<(typeof PAYMENT_METHOD_OPTIONS)[number], string> = {
  card: "Card",
  paypal: "PayPal",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  bank_transfer: "Bank transfer",
};

export function OnboardingForm({
  isEcommerce,
  accountEmail,
  defaultValues,
  locked,
}: {
  isEcommerce: boolean;
  accountEmail: string;
  defaultValues?: Partial<BriefFormValues>;
  locked?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [logo, setLogo] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<BriefFormValues>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      pagesNeeded: [],
      contactEmail: accountEmail,
      brandColors: [],
      referenceUrls: [],
      ...defaultValues,
    },
  });

  const domainChoice = watch("domainChoice");

  function onSubmit(values: BriefFormValues) {
    const formData = new FormData();
    formData.append("data", JSON.stringify(values));
    if (logo) formData.append("logo", logo);
    for (const photo of photos.slice(0, MAX_TOTAL_FILES)) formData.append("photos", photo);

    startTransition(async () => {
      const result = await submitBrief(formData);
      if (result && "error" in result) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {locked && (
        <p className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          Your brief is locked now that development has started — use{" "}
          <a href="/dashboard/requests" className="text-accent underline underline-offset-4">
            Requests
          </a>{" "}
          for further changes.
        </p>
      )}
      <fieldset disabled={locked} className="contents">
      <Card>
        <CardHeader>
          <CardTitle>The basics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="brandName">Brand / business name *</Label>
            <Input id="brandName" {...register("brandName")} />
            {errors.brandName && <p className="text-sm text-destructive">{errors.brandName.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="oneLiner">One-line description *</Label>
            <Input id="oneLiner" placeholder="What does your business do?" {...register("oneLiner")} />
            {errors.oneLiner && <p className="text-sm text-destructive">{errors.oneLiner.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="longDescription">Longer description</Label>
            <Textarea id="longDescription" rows={4} {...register("longDescription")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Look & feel</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Preferred theme</Label>
            <Controller
              control={control}
              name="themePreference"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a style" />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {THEME_LABELS[opt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="themeNotes">Notes on style</Label>
            <Input id="themeNotes" {...register("themeNotes")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Brand colors (up to 3)</Label>
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <Controller
                  key={i}
                  control={control}
                  name={`brandColors.${i}` as const}
                  render={({ field }) => (
                    <input
                      type="color"
                      className="h-10 w-14 rounded-md border border-input bg-transparent"
                      value={field.value ?? "#8a6212"}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="logo">Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">PNG, JPG, SVG, or WebP — up to 5MB.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photos">Photos</Label>
            <Input
              id="photos"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []).slice(0, MAX_TOTAL_FILES);
                const oversized = files.some((f) => f.size > MAX_UPLOAD_BYTES);
                if (oversized) toast.error("Some photos are over 5MB and will be skipped.");
                setPhotos(files.filter((f) => f.size <= MAX_UPLOAD_BYTES));
              }}
            />
            <p className="text-xs text-muted-foreground">Up to {MAX_TOTAL_FILES} images, 5MB each.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Sites you like (up to 3)</Label>
            {[0, 1, 2].map((i) => (
              <Input key={i} placeholder="https://…" {...register(`referenceUrls.${i}` as const)} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pages & domain</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Pages needed</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[...PAGE_OPTIONS, ...(isEcommerce ? (["shop"] as const) : [])].map((page) => (
                <Controller
                  key={page}
                  control={control}
                  name="pagesNeeded"
                  render={({ field }) => {
                    const checked = field.value?.includes(page);
                    return (
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const set = new Set(field.value ?? []);
                            if (v) set.add(page);
                            else set.delete(page);
                            field.onChange(Array.from(set));
                          }}
                        />
                        {PAGE_LABELS[page]}
                      </label>
                    );
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Domain</Label>
            <Controller
              control={control}
              name="domainChoice"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="has_domain" /> I have one
                  </label>
                  {domainChoice === "has_domain" && (
                    <Input placeholder="yourdomain.com" {...register("domainValue")} className="ml-6 max-w-xs" />
                  )}
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="need_domain" /> I need one
                  </label>
                </RadioGroup>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socialInstagram">Instagram</Label>
            <Input id="socialInstagram" {...register("socialInstagram")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socialFacebook">Facebook</Label>
            <Input id="socialFacebook" {...register("socialFacebook")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socialTiktok">TikTok</Label>
            <Input id="socialTiktok" {...register("socialTiktok")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socialExistingSite">Existing site</Label>
            <Input id="socialExistingSite" {...register("socialExistingSite")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Build contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactName">Name</Label>
            <Input id="contactName" {...register("contactName")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input id="contactPhone" {...register("contactPhone")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactEmail">Email *</Label>
            <Input id="contactEmail" type="email" {...register("contactEmail")} />
            {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
          </div>
        </CardContent>
      </Card>

      {isEcommerce && (
        <Card>
          <CardHeader>
            <CardTitle>E-commerce details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 sm:w-48">
              <Label htmlFor="ecommerceProductCount">Approx. product count</Label>
              <Input
                id="ecommerceProductCount"
                type="number"
                min={0}
                {...register("ecommerceProductCount", { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Payment methods</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PAYMENT_METHOD_OPTIONS.map((method) => (
                  <Controller
                    key={method}
                    control={control}
                    name="ecommercePaymentMethods"
                    render={({ field }) => {
                      const checked = field.value?.includes(method);
                      return (
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const set = new Set(field.value ?? []);
                              if (v) set.add(method);
                              else set.delete(method);
                              field.onChange(Array.from(set));
                            }}
                          />
                          {PAYMENT_LABELS[method]}
                        </label>
                      );
                    }}
                  />
                ))}
              </div>
            </div>
            <Controller
              control={control}
              name="ecommerceShippingNeeded"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  This site needs shipping
                </label>
              )}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Submitting…" : "Submit brief"}
        </Button>
      </div>
      </fieldset>
    </form>
  );
}
