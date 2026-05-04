import { readFileSync } from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { imageSize } from 'image-size';

type PostImageProps = {
  src?: string;
  alt?: string;
  title?: string;
};

function getDimensions(src: string): { width: number; height: number } | null {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, src);
    if (filePath !== publicDir && !filePath.startsWith(publicDir + path.sep)) {
      return null;
    }
    const { width, height } = imageSize(readFileSync(filePath));
    if (!width || !height) return null;
    return { width, height };
  } catch {
    return null;
  }
}

export function PostImage({ src, alt, title }: PostImageProps) {
  if (!src) return null;

  const dims = src.startsWith('/') ? getDimensions(src) : null;

  if (!dims) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? ''} title={title} />;
  }

  return (
    <figure>
      <Image
        src={src}
        alt={alt ?? ''}
        width={dims.width}
        height={dims.height}
        sizes="(min-width: 680px) 680px, 100vw"
      />
      {title ? <figcaption>{title}</figcaption> : null}
    </figure>
  );
}
