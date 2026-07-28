"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm, Controller, type Path } from "react-hook-form";
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
import type { en } from "@/lib/i18n/en";

type FormDict = (typeof en)["onboarding"]["form"];

// Draft autosave lives in localStorage, not the DB: the onboarding gate
// (src/proxy.ts) redirects away from /onboarding the moment any row exists
// in onboarding_briefs, so a server-persisted draft would lock a user out
// of finishing their own in-progress brief.
const DRAFT_STORAGE_KEY = "ws-onboarding-draft";

type StepId = "basics" | "look" | "pages" | "social" | "ecommerce";

const REQUIRED_FIELDS_BY_STEP: Record<StepId, Path<BriefFormValues>[]> = {
  basics: ["brandName", "oneLiner"],
  look: [],
  pages: [],
  social: ["contactEmail"],
  ecommerce: [],
};

export function OnboardingForm({
  isEcommerce,
  accountEmail,
  defaultValues,
  locked,
  t,
}: {
  isEcommerce: boolean;
  accountEmail: string;
  defaultValues?: Partial<BriefFormValues>;
  locked?: boolean;
  t: FormDict;
}) {
  const [pending, startTransition] = useTransition();
  const [logo, setLogo] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const restoredDraft = useRef(false);

  const steps = useMemo<StepId[]>(
    () => ["basics", "look", "pages", "social", ...(isEcommerce ? (["ecommerce"] as const) : [])],
    [isEcommerce],
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<BriefFormValues>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      pagesNeeded: [],
      contactEmail: accountEmail,
      // Seeded to match the color inputs' own display fallback (#8a6212) —
      // leaving this [] lets the three brandColors.{i} Controllers punch
      // undefined holes into the array the moment they mount, which then
      // fails z.array(z.string()) silently (no field renders a brandColors
      // error), permanently blocking submission with no visible feedback.
      brandColors: ["#8a6212", "#8a6212", "#8a6212"],
      referenceUrls: [],
      ...defaultValues,
    },
  });

  const domainChoice = watch("domainChoice");

  // Restore a locally-saved draft once, on first mount, if the user
  // navigated away mid-form and came back.
  useEffect(() => {
    if (restoredDraft.current || locked) return;
    restoredDraft.current = true;
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as Partial<BriefFormValues>;
      // A draft saved before the brandColors fix may have [null, null, null]
      // baked in, which fails validation the same silent way — drop it
      // rather than restore a brief that can never be submitted.
      const brandColors =
        draft.brandColors?.every((c) => typeof c === "string") ? draft.brandColors : ["#8a6212", "#8a6212", "#8a6212"];
      reset({
        pagesNeeded: [],
        contactEmail: accountEmail,
        referenceUrls: [],
        ...draft,
        brandColors,
      });
      toast.info(t.restoredDraftToast);
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [accountEmail, locked, reset, t.restoredDraftToast]);

  // Debounced autosave of every text/selection field (not the file inputs,
  // which can't be serialized to localStorage — logo/photos are only ever
  // attached at final submit anyway).
  useEffect(() => {
    if (locked) return;
    const subscription = watch((values) => {
      const timeout = setTimeout(() => {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
      }, 400);
      return () => clearTimeout(timeout);
    });
    return () => subscription.unsubscribe();
  }, [watch, locked]);

  async function goNext() {
    const fields = REQUIRED_FIELDS_BY_STEP[steps[stepIndex]];
    const valid = fields.length === 0 || (await trigger(fields));
    if (!valid) return;
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onSubmit(values: BriefFormValues) {
    // Client-side validation already passed for handleSubmit to call this,
    // so this is the commit point — clear the draft now rather than after
    // the server round-trip, since a successful submit redirects server-side
    // and never returns control to run cleanup here.
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);

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

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => toast.error(t.invalidToast))}
      className="flex flex-col gap-6"
    >
      {locked && (
        <p className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          {t.lockedNotePrefix}{" "}
          <a href="/dashboard/requests" className="text-accent underline underline-offset-4">
            {t.lockedNoteLink}
          </a>{" "}
          {t.lockedNoteSuffix}
        </p>
      )}

      {!locked && (
        <div className="flex items-center gap-2" aria-label={`${t.stepLabel} ${stepIndex + 1} ${t.of} ${steps.length}`}>
          {steps.map((step, i) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-accent" : "bg-muted"
              }`}
            />
          ))}
        </div>
      )}

      <fieldset disabled={locked} className="contents">
      {(locked || currentStep === "basics") && (
      <Card>
        <CardHeader>
          <CardTitle>{t.basics.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="brandName">{t.basics.brandName}</Label>
            <Input id="brandName" {...register("brandName")} />
            {errors.brandName && <p className="text-sm text-destructive">{t.required}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="oneLiner">{t.basics.oneLiner}</Label>
            <Input id="oneLiner" placeholder={t.basics.oneLinerPlaceholder} {...register("oneLiner")} />
            {errors.oneLiner && <p className="text-sm text-destructive">{t.required}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="longDescription">{t.basics.longDescription}</Label>
            <Textarea id="longDescription" rows={4} {...register("longDescription")} />
          </div>
        </CardContent>
      </Card>
      )}

      {(locked || currentStep === "look") && (
      <Card>
        <CardHeader>
          <CardTitle>{t.look.cardTitle}</CardTitle>
          <p className="text-xs text-muted-foreground">{t.look.cardSubtitle}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>{t.look.preferredTheme}</Label>
            <Controller
              control={control}
              name="themePreference"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.look.choosePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {t.themeOptions[opt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="themeNotes">{t.look.themeNotes}</Label>
            <Input id="themeNotes" {...register("themeNotes")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t.look.brandColors}</Label>
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
            <Label htmlFor="logo">{t.look.logo}</Label>
            <Input
              id="logo"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">{t.look.logoNote}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photos">{t.look.photos}</Label>
            <Input
              id="photos"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []).slice(0, MAX_TOTAL_FILES);
                const oversized = files.some((f) => f.size > MAX_UPLOAD_BYTES);
                if (oversized) toast.error(t.look.photosOversizedToast);
                setPhotos(files.filter((f) => f.size <= MAX_UPLOAD_BYTES));
              }}
            />
            <p className="text-xs text-muted-foreground">
              {t.look.photosNotePrefix} {MAX_TOTAL_FILES} {t.look.photosNoteSuffix}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t.look.sitesYouLike}</Label>
            {[0, 1, 2].map((i) => (
              <Input key={i} placeholder="https://…" {...register(`referenceUrls.${i}` as const)} />
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {(locked || currentStep === "pages") && (
      <Card>
        <CardHeader>
          <CardTitle>{t.pages.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t.pages.pagesNeeded}</Label>
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
                        {t.pageOptions[page]}
                      </label>
                    );
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t.pages.domain}</Label>
            <Controller
              control={control}
              name="domainChoice"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="has_domain" /> {t.pages.haveOne}
                  </label>
                  {domainChoice === "has_domain" && (
                    <Input
                      placeholder={t.pages.domainPlaceholder}
                      {...register("domainValue")}
                      className="ml-6 max-w-xs"
                    />
                  )}
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="need_domain" /> {t.pages.needOne}
                  </label>
                </RadioGroup>
              )}
            />
          </div>
        </CardContent>
      </Card>
      )}

      {(locked || currentStep === "social") && (
      <>
      <Card>
        <CardHeader>
          <CardTitle>{t.social.cardTitle}</CardTitle>
          <p className="text-xs text-muted-foreground">{t.social.cardSubtitle}</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socialInstagram">{t.social.instagram}</Label>
            <Input id="socialInstagram" {...register("socialInstagram")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socialFacebook">{t.social.facebook}</Label>
            <Input id="socialFacebook" {...register("socialFacebook")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socialTiktok">{t.social.tiktok}</Label>
            <Input id="socialTiktok" {...register("socialTiktok")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="socialExistingSite">{t.social.existingSite}</Label>
            <Input id="socialExistingSite" {...register("socialExistingSite")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.buildContact.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactName">{t.buildContact.name}</Label>
            <Input id="contactName" {...register("contactName")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactPhone">{t.buildContact.phone}</Label>
            <Input id="contactPhone" {...register("contactPhone")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactEmail">{t.buildContact.email}</Label>
            <Input id="contactEmail" type="email" {...register("contactEmail")} />
            {errors.contactEmail && <p className="text-sm text-destructive">{t.buildContact.invalidEmail}</p>}
          </div>
        </CardContent>
      </Card>
      </>
      )}

      {isEcommerce && (locked || currentStep === "ecommerce") && (
        <Card>
          <CardHeader>
            <CardTitle>{t.ecommerce.cardTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 sm:w-48">
              <Label htmlFor="ecommerceProductCount">{t.ecommerce.productCount}</Label>
              <Input
                id="ecommerceProductCount"
                type="number"
                min={0}
                {...register("ecommerceProductCount", { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t.ecommerce.paymentMethods}</Label>
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
                          {t.paymentOptions[method]}
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
                  {t.ecommerce.shippingNeeded}
                </label>
              )}
            />
          </CardContent>
        </Card>
      )}

      {locked ? null : (
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={goBack} disabled={stepIndex === 0}>
            {t.back}
          </Button>
          {isLastStep ? (
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? t.submitting : t.submitBrief}
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={goNext}>
              {t.continue}
            </Button>
          )}
        </div>
      )}
      </fieldset>
    </form>
  );
}
