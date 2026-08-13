import Giscus from "@giscus/react";
import type { Locale } from "../../i18n/locales";

export function PostComments({ locale }: { locale: Locale }) {
  return (
    <div className="min-h-[300px]">
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
    </div>
  );
}
