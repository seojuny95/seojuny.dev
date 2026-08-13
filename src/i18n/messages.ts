import type { Locale } from "./locales";

type MessageDictionary = {
  adjacentAria: string;
  audioNotReady: string;
  audioPlaybackError: string;
  back15: string;
  backToPosts: string;
  codeCopyAria: string;
  commentsAria: string;
  copied: string;
  forward15: string;
  jumpToCurrent: string;
  jumpToCurrentAria: string;
  linkCopiedAria: string;
  listen: string;
  listenPostAria: string;
  menuClose: string;
  menuOpen: string;
  mobileNavAria: string;
  minRead: (minutes: number) => string;
  nextPost: string;
  noPosts: string;
  notFoundBack: string;
  notFoundDesc: string;
  notFoundTitle: string;
  pageNavAria: string;
  pause: string;
  playerAria: string;
  prevPost: string;
  rateAria: (rate: number) => string;
  resume: string;
  searchClose: string;
  searchClear: string;
  searchLabel: string;
  searchMove: string;
  searchNoResults: string;
  searchOpen: string;
  searchPlaceholder: string;
  share: string;
  siteDescription: string;
  skipLink: string;
  switchToOther: string;
  tagsAria: string;
  toc: string;
};

export const messages: Record<Locale, MessageDictionary> = {
  ko: {
    adjacentAria: "이전·다음 글",
    audioNotReady: "이 글은 아직 음성이 준비되지 않았어요",
    audioPlaybackError: "음성을 재생할 수 없습니다.",
    back15: "15초 뒤로",
    backToPosts: "← Posts",
    codeCopyAria: "코드 복사",
    commentsAria: "댓글",
    copied: "복사됨",
    forward15: "15초 앞으로",
    jumpToCurrent: "읽는 곳으로",
    jumpToCurrentAria: "현재 읽는 위치로 이동",
    linkCopiedAria: "링크 복사됨",
    listen: "듣기",
    listenPostAria: "글 듣기",
    menuClose: "메뉴 닫기",
    menuOpen: "메뉴 열기",
    mobileNavAria: "모바일 메뉴",
    minRead: (minutes) => `${minutes}분`,
    nextPost: "다음 글 →",
    noPosts: "글이 아직 없습니다.",
    notFoundBack: "홈으로 돌아가기 →",
    notFoundDesc: "요청하신 주소가 이동되었거나 존재하지 않아요.",
    notFoundTitle: "페이지를 찾을 수 없습니다.",
    pageNavAria: "페이지 이동",
    pause: "일시정지",
    playerAria: "음성 재생 컨트롤",
    prevPost: "← 이전 글",
    rateAria: (rate) => `${rate}x 재생 속도`,
    resume: "이어 듣기",
    searchClose: "닫기",
    searchClear: "검색어 지우기",
    searchLabel: "게시물 검색",
    searchMove: "이동",
    searchNoResults: "결과 없음",
    searchOpen: "열기",
    searchPlaceholder: "검색어를 입력하세요",
    share: "공유",
    siteDescription: "소프트웨어 개발자가 일하고 공부하며 남기는 기록.",
    skipLink: "본문으로 건너뛰기",
    switchToOther: "English version",
    tagsAria: "태그",
    toc: "목차",
  },
  en: {
    adjacentAria: "Previous and next posts",
    audioNotReady: "Audio for this post is not ready yet",
    audioPlaybackError: "Unable to play this audio.",
    back15: "Back 15 seconds",
    backToPosts: "← Posts",
    codeCopyAria: "Copy code",
    commentsAria: "Comments",
    copied: "Copied",
    forward15: "Forward 15 seconds",
    jumpToCurrent: "Now reading",
    jumpToCurrentAria: "Jump to the sentence being read",
    linkCopiedAria: "Link copied",
    listen: "Listen",
    listenPostAria: "Listen to this post",
    menuClose: "Close menu",
    menuOpen: "Open menu",
    mobileNavAria: "Mobile menu",
    minRead: (minutes) => `${minutes} min read`,
    nextPost: "Next →",
    noPosts: "No posts yet.",
    notFoundBack: "Back to home →",
    notFoundDesc: "The address you requested has moved or does not exist.",
    notFoundTitle: "Page not found.",
    pageNavAria: "Page navigation",
    pause: "Pause",
    playerAria: "Audio player controls",
    prevPost: "← Previous",
    rateAria: (rate) => `${rate}x playback speed`,
    resume: "Resume",
    searchClose: "Close",
    searchClear: "Clear search",
    searchLabel: "Search posts",
    searchMove: "Navigate",
    searchNoResults: "No results",
    searchOpen: "Open",
    searchPlaceholder: "Type to search",
    share: "Share",
    siteDescription:
      "Notes from a software developer — on work, learning, and AI.",
    skipLink: "Skip to content",
    switchToOther: "한국어 버전",
    tagsAria: "Tags",
    toc: "Contents",
  },
};
