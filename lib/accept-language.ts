export function prefersEnglish(header: string): boolean {
  let en = 0;
  let ko = 0;
  for (const part of header.split(',')) {
    const [tagRaw, ...params] = part.trim().split(';');
    const tag = tagRaw.trim().toLowerCase();
    let q = 1;
    let hasValidQ = true;
    for (const param of params) {
      const match = param.trim().match(/^q=(\d(?:\.\d+)?)$/);
      if (match) {
        q = Number.parseFloat(match[1]);
      } else if (param.trim().startsWith('q=')) {
        hasValidQ = false;
        break;
      }
    }
    if (!hasValidQ) continue;
    if (tag === 'en' || tag.startsWith('en-')) en = Math.max(en, q);
    else if (tag === 'ko' || tag.startsWith('ko-')) ko = Math.max(ko, q);
  }
  return en > ko;
}
