import fs from 'node:fs';
import path from 'node:path';
import { MDXRemote } from 'next-mdx-remote/rsc';

export const metadata = { title: 'About — codydev.blog' };

const source = fs.readFileSync(
  path.join(process.cwd(), 'content', 'about.mdx'),
  'utf8',
);

export default function AboutPage() {
  return (
    <section>
      <header className="mb-10">
        <p className="text-[13px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
          Profile
        </p>
        <h1 className="text-[28px] font-semibold leading-[1.25] tracking-[-0.015em]">About</h1>
      </header>
      <div className="prose-blog">
        <MDXRemote source={source} />
      </div>
    </section>
  );
}
