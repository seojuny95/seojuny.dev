import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="ui-sans text-center py-20">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-[var(--muted)] mb-6">페이지를 찾을 수 없습니다.</p>
      <Link href="/" className="no-underline">
        홈으로 →
      </Link>
    </section>
  );
}
