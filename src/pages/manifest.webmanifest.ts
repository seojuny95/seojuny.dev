import type { APIRoute } from "astro";

import { defaultLocale, localeLanguageTags, site } from "../config";
import { messages } from "../i18n/messages";

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: site.name,
      short_name: "seojuny",
      description: messages[defaultLocale].siteDescription,
      start_url: "/",
      display: "standalone",
      background_color: "#fafaf9",
      theme_color: "#fafaf9",
      lang: localeLanguageTags[defaultLocale],
      icons: [
        {
          src: "/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any",
        },
        {
          src: "/apple-icon.png",
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
      ],
    }),
    { headers: { "Content-Type": "application/manifest+json" } },
  );
