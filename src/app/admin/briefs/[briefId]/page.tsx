import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { MarkReviewedButton } from "@/components/admin/mark-reviewed-button";
import { Reveal } from "@/components/motion/reveal";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default async function AdminBriefDetailPage({
  params,
}: {
  params: Promise<{ briefId: string }>;
}) {
  const { briefId } = await params;
  const serviceRole = createServiceRoleClient();

  const { data: brief } = await serviceRole.from("onboarding_briefs").select("*").eq("id", briefId).maybeSingle();

  if (!brief) {
    notFound();
  }

  const { data: assets } = await serviceRole
    .from("brief_assets")
    .select("id, storage_path, kind, file_name, size_bytes")
    .eq("brief_id", briefId)
    .order("created_at", { ascending: true });

  const assetsWithUrls = await Promise.all(
    (assets ?? []).map(async (asset) => {
      const { data: signed } = await serviceRole.storage
        .from("client-assets")
        .createSignedUrl(asset.storage_path, 3600);
      return { ...asset, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  const socialLinks = (brief.social_links as Record<string, string | null>) ?? {};
  const socialEntries = Object.entries(socialLinks).filter(([, value]) => !!value);

  return (
    <div className="flex flex-col gap-6">
      <Reveal className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{brief.brand_name}</h1>
          <p className="text-sm text-muted-foreground">
            Submitted {new Date(brief.created_at).toLocaleString()}
            {brief.locked_at && ` · locked ${new Date(brief.locked_at).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={brief.reviewed_at ? "outline" : "secondary"}>
            {brief.reviewed_at ? `Reviewed ${new Date(brief.reviewed_at).toLocaleDateString()}` : "New"}
          </Badge>
          {!brief.reviewed_at && <MarkReviewedButton briefId={brief.id} />}
        </div>
      </Reveal>

      <Card>
        <CardHeader>
          <CardTitle>Brand</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="One-liner">{brief.one_liner}</Field>
          {brief.long_description && <Field label="Description">{brief.long_description}</Field>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {brief.theme_preference && <Field label="Theme preference">{brief.theme_preference}</Field>}
            {brief.theme_notes && <Field label="Theme notes">{brief.theme_notes}</Field>}
          </div>
          {brief.brand_colors && brief.brand_colors.length > 0 && (
            <Field label="Brand colors">
              <div className="flex flex-wrap gap-3">
                {brief.brand_colors.map((color: string) => (
                  <div key={color} className="flex items-center gap-2">
                    <span
                      className="size-6 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-muted-foreground">{color}</span>
                  </div>
                ))}
              </div>
            </Field>
          )}
          {brief.reference_urls && brief.reference_urls.length > 0 && (
            <Field label="Reference URLs">
              <div className="flex flex-col gap-1">
                {brief.reference_urls.map((url: string) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline underline-offset-4"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </Field>
          )}
          {brief.pages_needed && brief.pages_needed.length > 0 && (
            <Field label="Pages needed">
              <div className="flex flex-wrap gap-2">
                {brief.pages_needed.map((page: string) => (
                  <Badge key={page} variant="outline">
                    {page}
                  </Badge>
                ))}
              </div>
            </Field>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Domain & contact</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {brief.domain_choice && (
              <Field label="Domain">
                {brief.domain_choice === "has_domain" ? "Has a domain" : "Needs a domain"}
                {brief.domain_value && ` — ${brief.domain_value}`}
              </Field>
            )}
            <Field label="Contact email">{brief.contact_email}</Field>
            {brief.contact_name && <Field label="Contact name">{brief.contact_name}</Field>}
            {brief.contact_phone && <Field label="Contact phone">{brief.contact_phone}</Field>}
          </div>
          {socialEntries.length > 0 && (
            <Field label="Social links">
              <div className="flex flex-col gap-1">
                {socialEntries.map(([key, value]) => (
                  <div key={key}>
                    <span className="text-muted-foreground">{key}: </span>
                    <a
                      href={value ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline underline-offset-4"
                    >
                      {value}
                    </a>
                  </div>
                ))}
              </div>
            </Field>
          )}
        </CardContent>
      </Card>

      {(brief.ecommerce_product_count != null ||
        (brief.ecommerce_payment_methods && brief.ecommerce_payment_methods.length > 0) ||
        brief.ecommerce_shipping_needed != null) && (
        <Card>
          <CardHeader>
            <CardTitle>E-commerce</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {brief.ecommerce_product_count != null && (
                <Field label="Product count">{brief.ecommerce_product_count}</Field>
              )}
              {brief.ecommerce_shipping_needed != null && (
                <Field label="Shipping needed">{brief.ecommerce_shipping_needed ? "Yes" : "No"}</Field>
              )}
              {brief.ecommerce_payment_methods && brief.ecommerce_payment_methods.length > 0 && (
                <Field label="Payment methods">
                  <div className="flex flex-wrap gap-2">
                    {brief.ecommerce_payment_methods.map((method: string) => (
                      <Badge key={method} variant="outline">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </Field>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>Logo and photo uploads, shown via time-limited signed URLs.</CardDescription>
        </CardHeader>
        <CardContent>
          {assetsWithUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {assetsWithUrls.map((asset) => (
                <a
                  key={asset.id}
                  href={asset.signedUrl ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-2"
                >
                  <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                    {asset.signedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset.signedUrl} alt={asset.file_name} className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="truncate">{asset.file_name}</p>
                    <p>
                      {asset.kind} · {Math.round(asset.size_bytes / 1024)} KB
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No assets uploaded.</p>
          )}
        </CardContent>
      </Card>

      <Separator />
      <Link href="/admin/briefs" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to briefs
      </Link>
    </div>
  );
}
