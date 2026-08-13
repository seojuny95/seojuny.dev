import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Locale } from "../../i18n/locales";
import { messages } from "../../i18n/messages";
import { localePath } from "../../i18n/routing";

interface Props {
  locale: Locale;
  pathname: string;
}

export function MobileMenu({ locale, pathname }: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const homePath = localePath(locale);
  const aboutPath = localePath(locale, "/about");
  const t = messages[locale];
  const items = [
    { href: homePath, label: "Posts", active: pathname !== aboutPath },
    { href: aboutPath, label: "About", active: pathname === aboutPath },
  ];

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    dialog?.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={open ? t.menuClose : t.menuOpen}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="relative -mr-1.5 inline-flex h-8 w-8 items-center justify-center text-[var(--fg)] md:hidden"
      >
        <span
          className="hamburger-bar"
          style={{
            top: open ? "50%" : "calc(50% - 4px)",
            transform: `translate(-50%, -50%) rotate(${open ? 45 : 0}deg)`,
          }}
        />
        <span
          className="hamburger-bar"
          style={{
            top: open ? "50%" : "calc(50% + 4px)",
            transform: `translate(-50%, -50%) rotate(${open ? -45 : 0}deg)`,
          }}
        />
      </button>

      {open &&
        createPortal(
          <dialog
            ref={dialogRef}
            id="mobile-menu"
            aria-label={t.mobileNavAria}
            onClose={() => setOpen(false)}
            className="mobile-menu-in fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none flex-col border-0 bg-[var(--bg)] p-0 md:hidden"
          >
            <div className="shrink-0 border-b border-[var(--rule)]">
              <div className="mx-auto flex h-[57px] w-full max-w-[680px] items-center px-4 sm:px-5">
                <a
                  href={homePath}
                  className="shrink-0 text-[15px] font-semibold tracking-[-0.012em]"
                >
                  seojuny
                  <span className="font-normal text-[var(--muted)]">.dev</span>
                </a>
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label={t.menuClose}
                  autoFocus
                  className="ml-auto -mr-1.5 inline-flex h-8 w-8 items-center justify-center text-[var(--fg)]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
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
            <nav
              aria-label={t.mobileNavAria}
              className="mobile-menu-stagger flex flex-col px-5 pt-4 pb-6 text-[24px] font-semibold tracking-[-0.012em]"
            >
              {items.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{ "--i": index } as React.CSSProperties}
                  aria-current={item.active ? "page" : undefined}
                  className="flex items-center justify-between border-b border-[var(--rule)] py-3 text-[var(--fg)]"
                >
                  <span>{item.label}</span>
                  {item.active ? (
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--yc)]"
                    />
                  ) : (
                    <svg
                      aria-hidden="true"
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
                </a>
              ))}
            </nav>
          </dialog>,
          document.body,
        )}
    </>
  );
}
