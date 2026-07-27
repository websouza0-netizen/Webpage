export function BlobField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 -top-32 size-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -right-10 top-10 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 size-72 rounded-full bg-accent/10 blur-3xl" />
    </div>
  );
}
