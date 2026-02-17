
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";



// Logo "Centang" (Verified) dari index.html dalam format Data URI
const BRAND_LOGO_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234f46e5' d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z'/%3E%3Cpath fill='%23ffffff' d='M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'/%3E%3C/svg%3E";

export const METADATA = {
  name: "AH SHOOT",
  description: "Verify EAS attestations instantly", // Max 35 chars
  bannerImageUrl: BRAND_LOGO_SVG,
  iconImageUrl: BRAND_LOGO_SVG,
  homeUrl: process.env.NEXT_PUBLIC_URL ?? "https://ah-shoot-check.vercel.app/",
  splashBackgroundColor: "#FFFFFF",
};


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}