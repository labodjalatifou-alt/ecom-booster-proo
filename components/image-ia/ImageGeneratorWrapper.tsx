"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ImageGenerator = dynamic(
  () => import('@/components/image-ia/ImageGenerator'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    ),
  }
);

export default function ImageGeneratorWrapper() {
  return <ImageGenerator />;
}
