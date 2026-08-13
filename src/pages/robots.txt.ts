import type { APIRoute } from "astro";

import { site as siteConfig } from "../config";

export const GET: APIRoute = ({ site: astroSite }) => {
  const sitemap = new URL("sitemap.xml", astroSite ?? siteConfig.url).href;

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
