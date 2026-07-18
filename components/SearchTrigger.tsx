"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function getModKeyClient() {
  const ua = navigator.userAgent;
  const platform =
    (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    "";
  return /Mac|iPhone|iPad|iPod/.test(platform) || /Mac|iPhone|iPad|iPod/.test(ua) ? "⌘" : "Ctrl";
}

function getModKeyServer() {
  return "";
}

export function SearchTrigger() {
  const modKey = useSyncExternalStore(subscribe, getModKeyClient, getModKeyServer);

  const open = () => window.dispatchEvent(new Event("open-search"));

  return (
    <button
      type="button"
      onClick={open}
      className="inline-flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300"
    >
      <span className="sr-only sm:hidden">Search</span>
      <svg className="sm:hidden" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10.3 10.3L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span className="link hidden sm:inline">Search</span>
      {modKey ? (
        <kbd className="kbd hidden sm:inline-flex">
          <span>{modKey}</span>
          <span>K</span>
        </kbd>
      ) : null}
    </button>
  );
}
