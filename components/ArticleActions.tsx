import { ShareButton } from './ShareButton';
import { SpeechPlayer } from './SpeechPlayer';

// 글 헤더와 본문 사이 액션 바: 왼쪽 듣기 컨트롤 + 오른쪽 공유.
export function ArticleActions({
  audioSrc,
  timingSrc,
}: {
  audioSrc?: string;
  timingSrc?: string;
}) {
  return (
    <div className="post-actions">
      <SpeechPlayer audioSrc={audioSrc} timingSrc={timingSrc} />
      <ShareButton />
    </div>
  );
}
