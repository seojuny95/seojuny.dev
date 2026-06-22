import type { MDXRemoteProps } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import githubLightHighContrast from 'shiki/themes/github-light-high-contrast.mjs';

// github-light-high-contrast의 주석 토큰 색(#66707B, ~4.3:1)을 WCAG AA(4.5:1)에 맞게
// 더 어둡게 덮은 사본 — 그 외 색은 그대로 둔다.
const accessibleCodeTheme = {
  ...githubLightHighContrast,
  name: 'github-light-high-contrast-aa',
  tokenColors: (githubLightHighContrast.tokenColors ?? []).map((tc) => {
    const scopes = Array.isArray(tc.scope) ? tc.scope : tc.scope ? [tc.scope] : [];
    return scopes.some((s) => s.includes('comment'))
      ? { ...tc, settings: { ...tc.settings, foreground: '#586573' } }
      : tc;
  }),
};

export const mdxOptions: MDXRemoteProps['options'] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeUnwrapImages,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            className: ['heading-anchor'],
            ariaHidden: 'true',
            tabIndex: -1,
          },
          content: { type: 'text', value: '#' },
        },
      ],
      [rehypePrettyCode, { theme: accessibleCodeTheme, keepBackground: false }],
      rehypeKatex,
    ],
  },
};
