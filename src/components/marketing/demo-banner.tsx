import Link from "next/link";

export function DemoBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 bg-black px-4 py-2.5 text-center text-xs text-white">
      <span>This is a WebSouza demo project — not a real business.</span>
      <Link href="/" className="underline underline-offset-2 hover:no-underline">
        Back to WebSouza
      </Link>
    </div>
  );
}
