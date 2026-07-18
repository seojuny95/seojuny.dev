"use client";

import { useEffect, useRef, useState } from "react";
import Giscus from "@giscus/react";
import type { Locale } from "@/lib/i18n";

export function Comments({ locale }: { locale: Locale }) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;
    const node = sentinelRef.current;
    if (!node) return;

    // Fallback for environments without IntersectionObserver (very old browsers).
    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setShouldLoad(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={sentinelRef} className="min-h-[300px]">
      {shouldLoad ? (
        <Giscus
          id="comments"
          repo="seojuny95/seojuny.dev"
          repoId="R_kgDOSQGXuQ"
          category="Announcements"
          categoryId="DIC_kwDOSQGXuc4C7-rz"
          mapping="pathname"
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme="light"
          lang={locale}
          loading="lazy"
        />
      ) : null}
    </div>
  );
}
