import { ShareButton } from './ShareButton';
import { SpeechPlayer } from './SpeechPlayer';
import type { Locale } from '@/lib/i18n';

export function ArticleActions({
  audioSrc,
  timingSrc,
  locale,
}: {
  audioSrc?: string;
  timingSrc?: string;
  locale: Locale;
}) {
  return (
    <div className="post-actions">
      <SpeechPlayer audioSrc={audioSrc} timingSrc={timingSrc} locale={locale} />
      <ShareButton locale={locale} />
    </div>
  );
}
