import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = () => {
  console.info("[runtime]", JSON.stringify({ node: process.version }));
  return new Response(null, { status: 204 });
};
