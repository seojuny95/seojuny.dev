import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="py-24">
      <p className="text-[12px] uppercase tracking-[0.2em] text-[var(--muted)] mb-4">
        404
      </p>
      <h1 className="text-[26px] font-semibold leading-[1.3] tracking-[-0.01em] mb-3">
        페이지를 찾을 수 없습니다.
      </h1>
      <p className="text-[14px] text-[var(--muted)] mb-8">
        요청하신 주소가 이동되었거나 존재하지 않아요.
      </p>
      <Link
        href="/"
        className="link text-[14px] hover:text-[var(--muted)] transition-colors duration-300"
      >
        홈으로 돌아가기 →
      </Link>
    </section>
  );
}
