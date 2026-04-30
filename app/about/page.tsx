import fs from 'node:fs';
import path from 'node:path';
import { MDXRemote } from 'next-mdx-remote/rsc';

export const metadata = { title: 'About — seojuny.blog' };

export default function AboutPage() {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'content', 'about.mdx'),
    'utf8',
  );
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
      <ul className="mt-10 flex items-center gap-5 text-[var(--muted)]">
        <li>
          <a
            href="https://github.com/seojuny95"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex items-center transition-colors hover:text-[var(--fg)]"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.79 2.74 1.27 3.4.97.1-.76.4-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
          </a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/in/seoj95/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="inline-flex items-center transition-colors hover:text-[var(--fg)]"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
            </svg>
          </a>
        </li>
      </ul>
    </section>
  );
}
