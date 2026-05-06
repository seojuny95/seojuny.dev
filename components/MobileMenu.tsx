'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/nav';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="md:hidden relative inline-flex w-8 h-8 items-center justify-center text-[var(--fg)] -mr-1.5"
      >
        <span
          className="hamburger-bar"
          style={{
            top: open ? '50%' : 'calc(50% - 4px)',
            transform: `translate(-50%, -50%) rotate(${open ? 45 : 0}deg)`,
          }}
        />
        <span
          className="hamburger-bar"
          style={{
            top: open ? '50%' : 'calc(50% + 4px)',
            transform: `translate(-50%, -50%) rotate(${open ? -45 : 0}deg)`,
          }}
        />
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
        <div
          id="mobile-menu"
          className="mobile-menu-in fixed inset-0 z-50 bg-[var(--bg)] md:hidden flex flex-col"
        >
          <div className="shrink-0 border-b border-[var(--rule)]">
            <div className="mx-auto w-full max-w-[680px] px-4 sm:px-5 h-[57px] flex items-center">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="shrink-0 font-semibold text-[15px] tracking-[-0.012em]"
              >
                seojuny
                <span className="text-[var(--muted)] font-normal">.dev</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="ml-auto inline-flex w-8 h-8 items-center justify-center text-[var(--fg)] -mr-1.5"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 2L12 12M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <nav className="mobile-menu-stagger flex flex-col px-5 pt-4 pb-6 text-[24px] font-semibold tracking-[-0.012em]">
            {NAV_ITEMS.map((item, i) => {
              const active = item.match.some(
                (m) => pathname === m || pathname.startsWith(`${m}/`),
              );
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ ['--i' as string]: i }}
                  className={`py-3 border-b border-[var(--rule)] flex items-center justify-between ${
                    active ? 'text-[var(--fg)]' : 'text-[var(--fg)]'
                  }`}
                >
                  <span>{item.label}</span>
                  {active ? (
                    <span
                      aria-hidden
                      className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--yc)]"
                    />
                  ) : (
                    <svg
                      aria-hidden
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="text-[var(--muted)]"
                    >
                      <path
                        d="M5 3L9 7L5 11"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
