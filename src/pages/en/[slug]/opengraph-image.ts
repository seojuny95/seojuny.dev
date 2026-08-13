import type { APIRoute, GetStaticPaths } from "astro";

import { getAllPosts, type Post } from "../../../lib/content/posts";
import { renderPostOgImage } from "../../../lib/seo/og-image";

export const getStaticPaths = (async () =>
  (await getAllPosts("en")).map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  renderPostOgImage(props.post as Post, "en");
