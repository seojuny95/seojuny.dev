export type Locale = 'ko' | 'en';

export const locales = ['ko', 'en'] as const satisfies readonly Locale[];
export const defaultLocale: Locale = 'ko';

export function otherLocale(locale: Locale): Locale {
  return locale === 'ko' ? 'en' : 'ko';
}

export function localePath(locale: Locale, path: string = '/'): string {
  if (locale === 'ko') return path;
  return path === '/' ? '/en' : `/en${path}`;
}

export function switchLocalePath(
  pathname: string,
  to: Locale,
  availableSlugs: readonly string[],
): string {
  const bare = pathname === '/en' ? '/' : pathname.replace(/^\/en\//, '/');
  if (bare === '/' || bare === '/about') return localePath(to, bare);
  const slug = bare.replace(/^\//, '');
  return availableSlugs.includes(slug) ? localePath(to, bare) : localePath(to);
}

type UiDict = {
  siteDescription: string;
  ogLocale: string;
  bcp47: string;
  jobTitle: string;
  skipLink: string;
  noPosts: string;
  minRead: (minutes: number) => string;
  backToPosts: string;
  pageNavAria: string;
  adjacentAria: string;
  prevPost: string;
  nextPost: string;
  tagsAria: string;
  commentsAria: string;
  toc: string;
  share: string;
  copied: string;
  linkCopiedAria: string;
  searchPlaceholder: string;
  searchNoResults: string;
  searchMove: string;
  searchOpen: string;
  searchClose: string;
  listen: string;
  pause: string;
  resume: string;
  listenPostAria: string;
  audioNotReady: string;
  playerAria: string;
  jumpToCurrent: string;
  jumpToCurrentAria: string;
  back15: string;
  forward15: string;
  rateAria: (rate: number) => string;
  notFoundTitle: string;
  notFoundDesc: string;
  notFoundBack: string;
  aboutLlmsLine: string;
  switchToOther: string;
};

export const ui: Record<Locale, UiDict> = {
  ko: {
    siteDescription: '소프트웨어 개발자가 일하고 공부하며 남기는 기록.',
    ogLocale: 'ko_KR',
    bcp47: 'ko-KR',
    jobTitle: '소프트웨어 개발자',
    skipLink: '본문으로 건너뛰기',
    noPosts: '글이 아직 없습니다.',
    minRead: (minutes) => `${minutes}분`,
    backToPosts: '← Posts',
    pageNavAria: '페이지 이동',
    adjacentAria: '이전·다음 글',
    prevPost: '← 이전 글',
    nextPost: '다음 글 →',
    tagsAria: '태그',
    commentsAria: '댓글',
    toc: '목차',
    share: '공유',
    copied: '복사됨',
    linkCopiedAria: '링크 복사됨',
    searchPlaceholder: '검색어를 입력하세요',
    searchNoResults: '결과 없음',
    searchMove: '이동',
    searchOpen: '열기',
    searchClose: '닫기',
    listen: '듣기',
    pause: '일시정지',
    resume: '이어 듣기',
    listenPostAria: '글 듣기',
    audioNotReady: '이 글은 아직 음성이 준비되지 않았어요',
    playerAria: '음성 재생 컨트롤',
    jumpToCurrent: '읽는 곳으로',
    jumpToCurrentAria: '현재 읽는 위치로 이동',
    back15: '15초 뒤로',
    forward15: '15초 앞으로',
    rateAria: (rate) => `${rate}x 재생 속도`,
    notFoundTitle: '페이지를 찾을 수 없습니다.',
    notFoundDesc: '요청하신 주소가 이동되었거나 존재하지 않아요.',
    notFoundBack: '홈으로 돌아가기 →',
    aboutLlmsLine: 'seojuny 소개와 GitHub·LinkedIn 링크',
    switchToOther: 'English version',
  },
  en: {
    siteDescription: 'Notes from a software developer — on work, learning, and AI.',
    ogLocale: 'en_US',
    bcp47: 'en-US',
    jobTitle: 'Software Developer',
    skipLink: 'Skip to content',
    noPosts: 'No posts yet.',
    minRead: (minutes) => `${minutes} min read`,
    backToPosts: '← Posts',
    pageNavAria: 'Page navigation',
    adjacentAria: 'Previous and next posts',
    prevPost: '← Previous',
    nextPost: 'Next →',
    tagsAria: 'Tags',
    commentsAria: 'Comments',
    toc: 'Contents',
    share: 'Share',
    copied: 'Copied',
    linkCopiedAria: 'Link copied',
    searchPlaceholder: 'Type to search',
    searchNoResults: 'No results',
    searchMove: 'Navigate',
    searchOpen: 'Open',
    searchClose: 'Close',
    listen: 'Listen',
    pause: 'Pause',
    resume: 'Resume',
    listenPostAria: 'Listen to this post',
    audioNotReady: 'Audio for this post is not ready yet',
    playerAria: 'Audio player controls',
    jumpToCurrent: 'Now reading',
    jumpToCurrentAria: 'Jump to the sentence being read',
    back15: 'Back 15 seconds',
    forward15: 'Forward 15 seconds',
    rateAria: (rate) => `${rate}x playback speed`,
    notFoundTitle: 'Page not found.',
    notFoundDesc: 'The address you requested has moved or does not exist.',
    notFoundBack: 'Back to home →',
    aboutLlmsLine: 'About seojuny with GitHub and LinkedIn links',
    switchToOther: '한국어 버전',
  },
};
