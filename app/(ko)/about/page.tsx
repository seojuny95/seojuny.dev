import { AboutView, aboutMetadata } from "@/components/pages/AboutPage";

export const metadata = aboutMetadata("ko");

export default function Page() {
  return <AboutView locale="ko" />;
}
