import { SiteShell } from '@/components/layout/SiteShell';
import { buildSiteMetadata } from '@/lib/metadata';

export const metadata = buildSiteMetadata('ko');

export default function KoLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="ko">{children}</SiteShell>;
}
