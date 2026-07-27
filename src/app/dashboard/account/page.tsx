import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AccountPanel } from "@/components/dashboard/account-panel";
import { Reveal } from "@/components/motion/reveal";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hasGoogle = (user?.app_metadata?.providers as string[] | undefined)?.includes("google") ?? false;

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">Manage your login and account.</p>
      </Reveal>
      <Reveal delay={0.05}>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountPanel email={user?.email ?? ""} hasGoogle={hasGoogle} />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
