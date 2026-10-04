"use client";

import { useEffect, useRef, useState } from "react";
import type { Viewer } from "@/three/viewer";

/** Interactive 3D model. three.js is loaded only when this mounts. */
export function Viewer3D({ slug, variantId }: { slug: string; variantId: string }) {
  const container = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const initialVariant = useRef(variantId);

  useEffect(() => {
    let cancelled = false;
    import("@/three/viewer")
      .then(({ mountViewer }) => {
        if (cancelled || !container.current) return;
        viewer.current = mountViewer(container.current, slug, initialVariant.current);
        setState("ready");
      })
      .catch(() => setState("error"));
    return () => {
      cancelled = true;
      viewer.current?.dispose();
      viewer.current = null;
    };
  }, [slug]);

  useEffect(() => {
    viewer.current?.update(variantId);
  }, [variantId]);

  return (
    <div className="relative h-full w-full">
      <div ref={container} className="h-full w-full" aria-label="Interaktivní 3D model, otáčejte tažením" role="img" />
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#e9e6e1]">
          <span className="chip bg-white/80 text-muted">Načítám 3D model…</span>
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#e9e6e1] p-6 text-center text-sm text-muted">
          3D náhled se nepodařilo načíst. Váš prohlížeč možná nepodporuje WebGL.
        </div>
      )}
      {state === "ready" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <span className="chip bg-white/85 text-muted backdrop-blur">Tažením otáčejte · kolečkem přibližte</span>
        </div>
      )}
    </div>
  );
}
