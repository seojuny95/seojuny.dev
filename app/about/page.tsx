import fs from 'node:fs';
import path from 'node:path';
import { MDXRemote } from 'next-mdx-remote/rsc';

export const metadata = { title: 'About — seojun.blog' };

const source = fs.readFileSync(
  path.join(process.cwd(), 'content', 'about.mdx'),
  'utf8',
);

export default function AboutPage() {
  return (
    <section className="prose-blog">
      <MDXRemote source={source} />
    </section>
  );
}
