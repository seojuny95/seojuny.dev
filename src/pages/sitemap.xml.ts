import type { APIRoute } from "astro";

import { site as siteConfig } from "../config";

export const GET: APIRoute = ({ site: astroSite }) => {
  const childSitemap = new URL("sitemap-0.xml", astroSite ?? siteConfig.url)
    .href;
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `<sitemap><loc>${childSitemap}</loc></sitemap>`,
    "</sitemapindex>",
  ].join("");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
