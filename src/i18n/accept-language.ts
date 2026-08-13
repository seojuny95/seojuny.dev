export function prefersEnglish(header: string): boolean {
  let englishQuality = 0;
  let koreanQuality = 0;

  for (const part of header.split(",")) {
    const [tagValue, ...parameters] = part.trim().split(";");
    const tag = tagValue.trim().toLowerCase();
    let quality = 1;
    let validQuality = true;

    for (const parameter of parameters) {
      const normalized = parameter.trim();
      const match = normalized.match(/^q=(\d(?:\.\d+)?)$/);

      if (match) {
        quality = Number.parseFloat(match[1]);
        if (quality < 0 || quality > 1) {
          validQuality = false;
          break;
        }
      } else if (normalized.startsWith("q=")) {
        validQuality = false;
        break;
      }
    }

    if (!validQuality) continue;

    if (tag === "en" || tag.startsWith("en-")) {
      englishQuality = Math.max(englishQuality, quality);
    } else if (tag === "ko" || tag.startsWith("ko-")) {
      koreanQuality = Math.max(koreanQuality, quality);
    }
  }

  return englishQuality > koreanQuality;
}
