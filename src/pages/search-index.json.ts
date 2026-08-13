import type { APIRoute } from "astro";

import { getSearchIndex } from "../lib/content/posts";

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await getSearchIndex("ko")), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
