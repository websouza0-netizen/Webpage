import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import type { BriefFormValues } from "@/lib/onboarding-schema";

export default async function BriefPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: brief }, { data: subscription }] = await Promise.all([
    supabase.from("onboarding_briefs").select("*").eq("client_id", user!.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan")
      .eq("client_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!brief) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Brief</h1>
        <Card>
          <CardContent className="flex flex-col items-start gap-3 py-8">
            <p className="text-sm text-muted-foreground">You haven&apos;t submitted a brief yet.</p>
            <Button asChild>
              <Link href="/onboarding">Start your brief</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const socialLinks = (brief.social_links as Record<string, string | null>) ?? {};

  const defaultValues: Partial<BriefFormValues> = {
    brandName: brief.brand_name,
    oneLiner: brief.one_liner,
    longDescription: brief.long_description ?? undefined,
    themePreference: brief.theme_preference ?? undefined,
    themeNotes: brief.theme_notes ?? undefined,
    brandColors: brief.brand_colors ?? [],
    referenceUrls: brief.reference_urls ?? [],
    pagesNeeded: brief.pages_needed ?? [],
    domainChoice: brief.domain_choice ?? undefined,
    domainValue: brief.domain_value ?? undefined,
    socialInstagram: socialLinks.instagram ?? undefined,
    socialFacebook: socialLinks.facebook ?? undefined,
    socialTiktok: socialLinks.tiktok ?? undefined,
    socialExistingSite: socialLinks.existing_site ?? undefined,
    contactName: brief.contact_name ?? undefined,
    contactPhone: brief.contact_phone ?? undefined,
    contactEmail: brief.contact_email,
    ecommerceProductCount: brief.ecommerce_product_count ?? undefined,
    ecommercePaymentMethods: brief.ecommerce_payment_methods ?? undefined,
    ecommerceShippingNeeded: brief.ecommerce_shipping_needed ?? undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Brief</h1>
        <p className="text-sm text-muted-foreground">
          {brief.locked_at
            ? "Locked once development starts — further changes go through a request."
            : "Editable until development starts."}
        </p>
      </div>
      <OnboardingForm
        isEcommerce={subscription?.plan === "ecommerce"}
        accountEmail={user!.email ?? ""}
        defaultValues={defaultValues}
        locked={!!brief.locked_at}
      />
    </div>
  );
}
