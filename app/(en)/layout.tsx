import { SiteShell } from "@/components/layout/SiteShell";
import { buildSiteMetadata } from "@/lib/metadata";

export const metadata = buildSiteMetadata("en");

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="en">{children}</SiteShell>;
}
