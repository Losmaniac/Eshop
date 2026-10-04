"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/content/products";
import { asset } from "@/lib/site";

export function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-steel">
        {current ? (
          <Image
            key={current.src}
            src={asset(current.src)}
            alt={current.alt}
            fill
            preload
            fetchPriority="high"
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="fade-in object-cover"
          />
        ) : (
          <div className="flex h-full items-end p-5 text-[#a9a59f]">{name}</div>
        )}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3" aria-label="Další fotografie">
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Zobrazit fotografii ${index + 1}: ${image.alt}`}
                aria-current={index === active}
                className={`relative block h-16 w-20 overflow-hidden rounded-sm bg-steel sm:h-20 sm:w-28 ${
                  index === active ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={asset(image.src)} alt="" fill sizes="112px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
