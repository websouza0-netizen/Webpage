import { WsEditorial } from "@/components/ws-editorial-wrapper";
import { I18nProvider } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Hero } from "@/components/marketing/hero";
import { TrustedBy } from "@/components/marketing/trusted-by";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { PricingSection } from "@/components/marketing/pricing-section";
import { ProjectsGrid } from "@/components/marketing/projects-grid";
import { Testimonials } from "@/components/marketing/testimonials";
import { FAQ } from "@/components/marketing/faq";
import { ContactCta } from "@/components/marketing/contact-cta";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { SITE_URL } from "@/lib/site-url";
import { PLANS } from "@/lib/pricing";

function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WebSouza",
    url: SITE_URL,
    description:
      "WebSouza builds and runs your business website end to end: design, delivery, billing, and support in one subscription.",
    makesOffer: PLANS.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      description: plan.tagline,
      price: plan.monthlyPrice,
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: plan.monthlyPrice,
        priceCurrency: "EUR",
        billingDuration: "P1M",
      },
    })),
  };
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <WsEditorial className="min-h-screen">
      <script
        type="application/ld+json"
        // Static, config-driven data only (no user input) — safe to inline.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
      <I18nProvider>
        <MarketingNav isAuthenticated={!!user} />
        <Hero />
        <TrustedBy />
        <FeaturesGrid />
        <PricingSection />
        <ProjectsGrid />
        <Testimonials />
        <FAQ />
        <ContactCta />
        <MarketingFooter />
      </I18nProvider>
    </WsEditorial>
  );
}
