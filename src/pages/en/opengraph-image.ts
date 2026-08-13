import type { APIRoute } from "astro";

import { renderSiteOgImage } from "../../lib/seo/og-image";

export const GET: APIRoute = () => renderSiteOgImage("en");
