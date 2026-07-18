import { renderSiteOgImage, ogSize, ogContentType } from "@/lib/og-image";

export const alt = "seojuny.dev";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSiteOgImage("en");
}
