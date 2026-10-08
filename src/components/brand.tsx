import type { SVGProps } from "react";
import { brandPaths } from "@/lib/brand-paths";

const BRAND_GREEN = "#00e878";

export function BrandWordmark({
  ink = "currentColor",
  green = BRAND_GREEN,
  className = "",
  ...props
}: SVGProps<SVGSVGElement> & { ink?: string; green?: string }) {
  return (
    <svg
      width="190"
      height="25"
      viewBox={brandPaths.viewBox}
      fill="none"
      className={`brand-wordmark ${className}`}
      aria-hidden="true"
      {...props}
    >
      <path
        className="brand-ink"
        fill={ink}
        fillRule="evenodd"
        d={brandPaths.whitePath}
      />
      <path
        className="brand-green"
        fill={green}
        fillRule="evenodd"
        d={brandPaths.greenPath}
      />
    </svg>
  );
}

export function BrandMark({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="29"
      height="29"
      viewBox={brandPaths.markBox}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path fillRule="evenodd" d={brandPaths.markPath} />
    </svg>
  );
}

export function GitHubIcon({
  size = 18,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.06c-3.1.67-3.75-1.32-3.75-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.7.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.7 2.6 1.21 3.24.92.1-.73.4-1.22.7-1.5-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.44-2.21 1.15-3-.11-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.56 0c2.12-1.43 3.04-1.14 3.04-1.14.61 1.54.23 2.68.11 2.96.72.79 1.15 1.78 1.15 3 0 4.29-2.61 5.24-5.1 5.51.4.35.75 1.02.75 2.06v3.06c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  );
}
