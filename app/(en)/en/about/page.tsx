import { AboutView, aboutMetadata } from '@/components/pages/AboutPage';

export const metadata = aboutMetadata('en');

export default function Page() {
  return <AboutView locale="en" />;
}
