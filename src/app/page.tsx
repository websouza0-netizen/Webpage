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

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <WsEditorial className="min-h-screen">
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
