const KOREAN_CPM = 500;
const LATIN_WPM = 220;
const CODE_WPM = 100;
const SECONDS_PER_IMAGE = 12;

export function readingTime(content: string): number {
  const codeWords = (content.match(/```[\s\S]*?```/g) ?? [])
    .map((block) => block.replace(/^```[^\n]*\n?/, "").replace(/```$/, ""))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const withoutCode = content.replace(/```[\s\S]*?```/g, " ");
  const imageCount = (withoutCode.match(/!\[[^\]]*\]\([^)]*\)/g) ?? []).length;
  const stripped = withoutCode
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, " $1 ")
    .replace(/`([^`]*)`/g, " $1 ")
    .replace(/<[^>]+>/g, " ");
  const korean = (stripped.match(/[가-힣]/g) ?? []).length;
  const latin = stripped
    .replace(/[가-힣]/g, " ")
    .split(/\s+/)
    .filter((word) => /[A-Za-z0-9]/.test(word)).length;
  const textMinutes = korean / KOREAN_CPM + latin / LATIN_WPM;
  const codeMinutes = codeWords / CODE_WPM;
  const imageMinutes = (imageCount * SECONDS_PER_IMAGE) / 60;

  return Math.max(1, Math.ceil(textMinutes + codeMinutes + imageMinutes));
}
