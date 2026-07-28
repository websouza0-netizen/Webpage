import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AccountPanel } from "@/components/dashboard/account-panel";
import { Reveal } from "@/components/motion/reveal";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = dictionaryFor(await getServerLocale()).dashboard.account;

  const hasGoogle = (user?.app_metadata?.providers as string[] | undefined)?.includes("google") ?? false;

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </Reveal>
      <Reveal delay={0.05}>
        <Card>
          <CardHeader>
            <CardTitle>{t.details}</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountPanel email={user?.email ?? ""} hasGoogle={hasGoogle} t={t} />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
