import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "@vercel/og";
import { createElement, type CSSProperties, type ReactNode } from "react";

import type { Locale } from "../../i18n/locales";
import { messages } from "../../i18n/messages";
import { formatDate, type Post } from "../content/posts";

export const ogImageSize = { width: 1200, height: 630 } as const;

const subtitle: Record<Locale, string> = {
  ko: "소프트웨어 개발과 AI 학습 기록",
  en: "Notes on software development and AI learning",
};

let fontPromise:
  | Promise<
      Array<{
        data: ArrayBuffer;
        name: string;
        style: "normal";
        weight: 400 | 700;
      }>
    >
  | undefined;

function arrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

function loadFonts() {
  fontPromise ??= Promise.all([
    readFile(
      path.join(
        process.cwd(),
        "node_modules/pretendard/dist/public/static/Pretendard-Regular.otf",
      ),
    ),
    readFile(
      path.join(
        process.cwd(),
        "node_modules/pretendard/dist/public/static/Pretendard-Bold.otf",
      ),
    ),
  ]).then(([regular, bold]) => [
    {
      name: "Pretendard",
      data: arrayBuffer(regular),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Pretendard",
      data: arrayBuffer(bold),
      weight: 700 as const,
      style: "normal" as const,
    },
  ]);

  return fontPromise;
}

function div(style: CSSProperties, ...children: ReactNode[]) {
  return createElement("div", { style }, ...children);
}

function brand(fontSize: number) {
  return div(
    {
      alignItems: "baseline",
      display: "flex",
      fontSize,
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },
    createElement("span", null, "seojuny"),
    createElement(
      "span",
      { style: { color: "#8a8a85", fontWeight: 400 } },
      ".dev",
    ),
  );
}

export async function renderSiteOgImage(locale: Locale): Promise<Response> {
  return new ImageResponse(
    div(
      {
        alignItems: "center",
        background: "#fafaf9",
        color: "#171717",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Pretendard",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      },
      brand(120),
      div(
        {
          color: "#8a8a85",
          display: "flex",
          fontSize: 32,
          letterSpacing: "-0.01em",
          marginTop: 28,
        },
        subtitle[locale],
      ),
    ),
    { ...ogImageSize, fonts: await loadFonts() },
  );
}

export async function renderPostOgImage(
  post: Post,
  locale: Locale,
): Promise<Response> {
  const metadata = [
    formatDate(post.data.date, locale),
    ...post.data.tags.map((tag) => `#${tag}`),
    messages[locale].minRead(post.readingTime),
  ].join("  ·  ");

  return new ImageResponse(
    div(
      {
        background: "#fafaf9",
        color: "#171717",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Pretendard",
        height: "100%",
        padding: 80,
        width: "100%",
      },
      brand(28),
      div(
        {
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 28,
          justifyContent: "center",
        },
        div(
          {
            color: "#171717",
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.022em",
            lineHeight: 1.2,
          },
          post.data.title,
        ),
        post.data.summary
          ? div(
              {
                color: "#8a8a85",
                display: "flex",
                fontSize: 32,
                letterSpacing: "-0.01em",
                lineHeight: 1.4,
              },
              post.data.summary,
            )
          : null,
      ),
      div(
        { display: "flex", flexDirection: "column", gap: 20 },
        div({ background: "#ececea", display: "flex", height: 1 }),
        div(
          {
            color: "#8a8a85",
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.01em",
          },
          metadata,
        ),
      ),
    ),
    { ...ogImageSize, fonts: await loadFonts() },
  );
}
