'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';

type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function Toc() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const nodes = document.querySelectorAll<HTMLHeadingElement>(
        '.prose-blog h2[id], .prose-blog h3[id]',
      );
      setHeadings(
        Array.from(nodes).map((el) => ({
          id: el.id,
          // Trailing '#' comes from the appended autolink anchor.
          text: (el.textContent ?? '').replace(/#\s*$/, '').trim(),
          level: el.tagName === 'H2' ? 2 : 3,
        })),
      );
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = '';
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 100) current = h.id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [headings]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    history.pushState(null, '', `#${id}`);
  };

  if (headings.length < 2) return null;

  return createPortal(
    <nav
      aria-label="목차"
      className="toc hidden xl:block fixed top-[130px] left-[calc(50%_+_372px)] w-[200px] max-h-[calc(100vh_-_190px)] overflow-y-auto"
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] mb-3">
        목차
      </p>
      <ul className="list-none p-0 m-0 flex flex-col text-[12.5px] leading-snug border-l border-[var(--rule)]">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => onClick(e, h.id)}
              aria-current={activeId === h.id ? 'location' : undefined}
              className={`block py-[5px] -ml-px border-l transition-colors duration-200 ${
                h.level === 3 ? 'pl-6' : 'pl-3'
              } ${
                activeId === h.id
                  ? 'border-[var(--fg)] text-[var(--fg)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>,
    document.body,
  );
}
