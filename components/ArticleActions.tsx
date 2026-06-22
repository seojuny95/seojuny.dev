import { ShareButton } from './ShareButton';
import { SpeechPlayer } from './SpeechPlayer';

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
