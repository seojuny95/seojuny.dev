import type { MDXRemoteProps } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeUnwrapImages from 'rehype-unwrap-images';

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
      [rehypePrettyCode, { theme: 'github-light', keepBackground: false }],
      rehypeKatex,
    ],
  },
};
