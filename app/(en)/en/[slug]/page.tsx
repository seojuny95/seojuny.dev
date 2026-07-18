import type { Metadata } from "next";
import { PostView, postStaticParams } from "@/components/pages/PostView";
import { buildPostMetadata } from "@/lib/metadata";
import { getPostBySlug } from "@/lib/posts";

export function generateStaticParams() {
  return postStaticParams("en");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    return buildPostMetadata(getPostBySlug(slug, "en"), "en");
  } catch {
    return {};
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostView locale="en" slug={slug} />;
}
