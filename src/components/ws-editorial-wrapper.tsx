import { grotesk, quote } from "@/app/fonts";
import { cn } from "@/lib/utils";

export function WsEditorial({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        grotesk.variable,
        quote.variable,
        "ws-editorial font-sans text-foreground antialiased",
        className,
      )}
    >
      {children}
    </div>
  );
}
