import { buildFeed } from "@/lib/feed";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildFeed("ko"), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
