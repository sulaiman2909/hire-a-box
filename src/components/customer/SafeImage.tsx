'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import ImagePlaceholder from './ImagePlaceholder';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  placeholderLabel: string;
  aspectRatioClass?: string;
}

export default function SafeImage({ src, placeholderLabel, aspectRatioClass, alt, ...props }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return <ImagePlaceholder label={placeholderLabel} aspectRatio={aspectRatioClass} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}
