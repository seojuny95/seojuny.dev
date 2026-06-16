import { getAllPosts } from '@/lib/posts';

// llms.txt — 사이트 핵심 콘텐츠를 LLM이 파싱하기 쉬운 마크다운으로 빌드 시 정적 생성.
export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://seojuny.dev';

const DESCRIPTION =
  '소프트웨어 개발자가 일하고 공부하며 남기는 기록.';

export function GET() {
  const posts = getAllPosts();

  const lines = [
    '# seojuny.dev',
    '',
    `> ${DESCRIPTION}`,
    '',
    '## Posts',
    '',
    ...posts.map((post) => {
      const url = `${SITE_URL}/${post.slug}`;
      return post.summary
        ? `- [${post.title}](${url}): ${post.summary}`
        : `- [${post.title}](${url})`;
    }),
    '',
    '## About',
    '',
    `- [About](${SITE_URL}/about): seojuny 소개와 GitHub·LinkedIn 링크`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
