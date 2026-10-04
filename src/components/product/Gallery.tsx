"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/content/products";
import { asset } from "@/lib/site";
import { Viewer3D } from "./Viewer3D";

type Props = { images: ProductImage[]; name: string; slug: string; variantId?: string };

export function Gallery({ images, name, slug, variantId }: Props) {
  const [active, setActive] = useState<number | "3d">(0);
  const index = active === "3d" ? -1 : Math.min(active, images.length - 1);
  const current = index >= 0 ? images[index] : undefined;

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#e9e6e1]">
        {active === "3d" ? (
          <Viewer3D slug={slug} variantId={variantId ?? ""} />
        ) : current ? (
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
          <div className="flex h-full items-end p-5 text-muted">{name}</div>
        )}
        {active !== "3d" && (
          <button
            type="button"
            onClick={() => setActive("3d")}
            className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-sm font-medium shadow-sm backdrop-blur transition hover:bg-white"
          >
            <Cube /> Zobrazit ve 3D
          </button>
        )}
      </div>
      <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-1" aria-label="Fotografie a 3D model">
        {images.map((image, i) => (
          <li key={image.src} className="shrink-0">
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Zobrazit obrázek ${i + 1}: ${image.alt}`}
              aria-current={i === index}
              className={`relative block h-16 w-20 overflow-hidden rounded-sm bg-[#e9e6e1] transition sm:h-20 sm:w-28 ${
                i === index ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={asset(image.src)} alt="" fill sizes="112px" className="object-cover" />
            </button>
          </li>
        ))}
        <li className="shrink-0">
          <button
            type="button"
            onClick={() => setActive("3d")}
            aria-current={active === "3d"}
            className={`flex h-16 w-20 flex-col items-center justify-center gap-1 rounded-sm bg-night text-xs font-medium text-white transition sm:h-20 sm:w-28 ${
              active === "3d" ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : "opacity-85 hover:opacity-100"
            }`}
          >
            <Cube /> 3D model
          </button>
        </li>
      </ul>
    </div>
  );
}

function Cube() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5 21 7v10l-9 4.5L3 17V7l9-4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 7l9 4.5L21 7M12 11.5V21.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
