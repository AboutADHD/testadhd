import Image from "next/image";
import { cn } from "@/lib/cn";
import { BRAND_LOGOS, type BrandKey } from "@/lib/site";

/**
 * Inline partner brand mark (DoctorADHD / About ADHD). Pure presentational —
 * no hooks or handlers — so it renders in both Server and Client trees. Assets
 * are self-hosted transparent PNGs (see lib/site.ts BRAND_LOGOS), optimised by
 * next/image.
 *
 * Pass `decorative` when an adjacent text label already names the brand, so
 * screen readers announce it once (the image becomes `alt=""` + aria-hidden).
 * Otherwise the brand name is exposed as the accessible name.
 */
export function BrandLogo({
  brand,
  size = 20,
  decorative = false,
  className,
}: {
  brand: BrandKey;
  /** Rendered (and intrinsic) px size. */
  size?: number;
  /** True when a visible text label already names the brand. */
  decorative?: boolean;
  className?: string;
}) {
  const logo = BRAND_LOGOS[brand];
  return (
    <Image
      src={logo.src}
      alt={decorative ? "" : logo.alt}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      sizes={`${size}px`}
      style={{ width: size, height: size }}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
