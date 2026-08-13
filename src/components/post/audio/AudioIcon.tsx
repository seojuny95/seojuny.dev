type IconName = "forward" | "pause" | "play" | "rewind";

export function AudioIcon({ name }: { name: IconName }) {
  if (name === "play") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="currentColor"
        aria-hidden
      >
        <path d="M3.5 2.5l8 4.5-8 4.5z" />
      </svg>
    );
  }

  if (name === "pause") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="currentColor"
        aria-hidden
      >
        <rect x="3.5" y="2.8" width="2.6" height="8.4" rx="0.6" />
        <rect x="7.9" y="2.8" width="2.6" height="8.4" rx="0.6" />
      </svg>
    );
  }

  const isRewind = name === "rewind";

  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={isRewind ? "M3 2v6h6" : "M21 2v6h-6"} />
      <path
        d={
          isRewind
            ? "M3.51 15a9 9 0 1 0 2.13-9.36L3 8"
            : "M20.49 15a9 9 0 1 1-2.13-9.36L21 8"
        }
      />
    </svg>
  );
}
