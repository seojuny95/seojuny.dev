import { ShareButton } from "./ShareButton";
import { PostAudioPlayer } from "./audio/PostAudioPlayer";
import type { Locale } from "../../i18n/locales";

export function PostActions({
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
      <PostAudioPlayer
        audioSrc={audioSrc}
        timingSrc={timingSrc}
        locale={locale}
      />
      <ShareButton locale={locale} />
    </div>
  );
}
