import Image from "next/image";
import type { ProductImage as ProductImageType } from "@/content/products";
import { asset } from "@/lib/site";

type Props = {
  image?: ProductImageType;
  /** Fallback label for the placeholder block when there is no image. */
  label: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** Image in a fixed-ratio box (set the ratio on the wrapper via className). */
export function ProductImage({ image, label, sizes, priority, className = "aspect-[4/3]" }: Props) {
  return (
    <div className={`relative overflow-hidden rounded-sm bg-steel ${className}`}>
      {image ? (
        <Image
          src={asset(image.src)}
          alt={image.alt}
          fill
          sizes={sizes}
          preload={priority}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-end p-5 text-sm text-[#a9a59f]">{label}</div>
      )}
    </div>
  );
}
