export function TeamLogo({ src, abbrev }: { src?: string; abbrev: string }) {
  if (!src) {
    return (
      <span className="grid size-6 place-items-center rounded bg-surface text-[9px] font-semibold">
        {abbrev}
      </span>
    );
  }
  // Remote SVGs from the NHL CDN; next/image would need SVG + remote host
  // config for no real gain at this size.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src={src} alt={abbrev} width={24} height={24} className="size-6" />
  );
}
