"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { bundlesContaining, getProduct, imagesFor, type CatalogVariant } from "@/lib/catalog";
import { formatPrice, formatWeight } from "@/lib/format";
import { MAX_QUANTITY } from "@/lib/pricing";
import { useCart } from "@/components/cart/CartProvider";
import { Notice } from "@/components/Notice";
import { DeliveryEstimate } from "./DeliveryEstimate";
import { Gallery } from "./Gallery";
import { SizeGuide } from "./SizeGuide";

const swatches: Record<string, string> = {
  corten: "#8a3d1c",
  ocel: "#3a3c40",
};

function findVariant(variants: CatalogVariant[], wanted: Record<string, string>, changed: string) {
  // Prefer an exact match; otherwise keep the option the user just changed
  // and pick the variant that matches most of the others.
  const score = (v: CatalogVariant) =>
    Object.entries(wanted).reduce((s, [name, value]) => s + (v.options[name] === value ? 1 : 0), 0);
  return variants.filter((v) => v.options[changed] === wanted[changed]).sort((a, b) => score(b) - score(a))[0];
}

export function ProductView({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const [variant, setVariant] = useState<CatalogVariant | undefined>(product.variants[0]);
  const images = imagesFor(product, variant?.options ?? {});

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <div className="lg:sticky lg:top-24">
          <Gallery images={images} name={product.name} slug={product.slug} variantId={variant?.id} />
        </div>
      </div>
      <div className="lg:col-span-5">
        <p className="eyebrow">{product.material}</p>
        <h1 className="mt-3 text-4xl md:text-5xl">{product.name}</h1>
        <p className="mt-4 text-lg text-muted">{product.shortDescription}</p>
        <div className="mt-8">
          {product.orderType === "cart" && variant ? (
            <BuyBox slug={slug} variant={variant} onVariant={setVariant} />
          ) : (
            <InquiryBox slug={slug} />
          )}
        </div>
      </div>
    </div>
  );
}

function InquiryBox({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  return (
    <div className="space-y-5">
      {product.priceFrom && (
        <p>
          <span className="text-3xl font-semibold tracking-tight tabular-nums">od {formatPrice(product.priceFrom)}</span>
          <span className="mt-1 block text-sm text-muted">Cena podle velikosti, materiálu a uchycení.</span>
        </p>
      )}
      <Link href="/poptavka" className="btn btn-primary w-full">
        Poptat realizaci
      </Link>
      <ol className="grid gap-3 text-[0.9375rem] sm:grid-cols-3">
        {["Pošlete logo (SVG, DXF, AI, PDF)", "Do 2 dnů máte nabídku", "Vyrobíme a namontujete"].map((step, i) => (
          <li key={step} className="card p-3">
            <span className="font-mono text-xs text-muted">0{i + 1}</span>
            <p className="mt-1 leading-snug">{step}</p>
          </li>
        ))}
      </ol>
      <Features slug={slug} />
    </div>
  );
}

function Features({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  if (!product.features) return null;
  return (
    <ul className="space-y-2 text-[0.9375rem]">
      {product.features.map((feature) => (
        <li key={feature} className="flex gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" className="mt-0.5 shrink-0 text-rust" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
  );
}

function BuyBox({ slug, variant, onVariant }: { slug: string; variant: CatalogVariant; onVariant: (v: CatalogVariant) => void }) {
  const product = getProduct(slug)!;
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [text, setText] = useState("");
  const [added, setAdded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const personalization = product.personalization;
  const extra = text.trim() && personalization ? personalization.price : 0;
  const bundle = bundlesContaining(slug)[0];
  const bundleSaving = bundle ? Math.max(...bundle.variants.map((v) => (v.compareAtPrice ?? v.price) - v.price)) : 0;

  // Sticky bar on small screens once the main button scrolls out of view.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function choose(name: string, value: string) {
    const next = findVariant(product.variants, { ...variant.options, [name]: value }, name);
    if (next) onVariant(next);
  }

  function addToCart() {
    add({ slug: product.slug, variantId: variant.id, quantity, personalization: text.trim() || undefined });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setText("");
    setQuantity(1);
  }

  const widthMm = Number((variant.options["Velikost"] ?? "").replace(/\D/g, "")) || 0;

  return (
    <>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          addToCart();
        }}
      >
        {product.optionNames.map((name) => {
          const values = [...new Set(product.variants.map((v) => v.options[name]))];
          return (
            <fieldset key={name}>
              <legend className="mb-2.5 flex w-full justify-between text-[0.9375rem] font-medium">
                {name}
                <span className="font-normal text-muted">{variant.options[name]}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const checked = variant.options[name] === value;
                  const swatch = swatches[value];
                  return (
                    <label
                      key={value}
                      className={`relative flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-2.5 text-[0.9375rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-rust ${
                        checked ? "border-ink bg-ink text-white" : "border-[#c9c4bd] bg-white hover:border-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`${id}-${name}`}
                        value={value}
                        checked={checked}
                        onChange={() => choose(name, value)}
                        className="sr-only"
                      />
                      {swatch && <span className="h-4 w-4 rounded-full ring-1 ring-white/40" style={{ background: swatch }} aria-hidden="true" />}
                      {value}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <p className="text-4xl font-semibold tracking-tight tabular-nums" aria-live="polite">
            {formatPrice(variant.price + extra)}
          </p>
          <p className="text-sm text-muted">
            {variant.dimensions} · {formatWeight(variant.weightKg)}
          </p>
          {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
            <p className="w-full text-[0.9375rem]">
              <s className="text-muted">{formatPrice(variant.compareAtPrice)}</s>{" "}
              <span className="chip bg-rust/10 text-rust-dark">ušetříte {formatPrice(variant.compareAtPrice - variant.price)}</span>
            </p>
          )}
        </div>

        {personalization && (
          <div>
            <label htmlFor={`${id}-text`} className="field-label">
              {personalization.label}
              {personalization.price > 0 && <span className="font-normal text-muted"> (+{formatPrice(personalization.price)})</span>}
            </label>
            <input
              id={`${id}-text`}
              className="field-input"
              value={text}
              maxLength={personalization.maxLength}
              onChange={(e) => setText(e.target.value)}
              aria-describedby={`${id}-text-help`}
              autoComplete="off"
              placeholder="např. Rodina Novákových"
            />
            <p id={`${id}-text-help`} className="field-help flex justify-between gap-4">
              <span>{personalization.help}</span>
              <span className="shrink-0 font-mono text-xs tabular-nums">
                {text.length}/{personalization.maxLength}
              </span>
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex items-center rounded-sm border border-[#c9c4bd] bg-white" role="group" aria-label="Množství">
            <button type="button" className="h-12 w-11 text-lg hover:text-rust-dark disabled:opacity-40" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Snížit množství">
              −
            </button>
            <span className="w-8 text-center tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button type="button" className="h-12 w-11 text-lg hover:text-rust-dark disabled:opacity-40" onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))} disabled={quantity >= MAX_QUANTITY} aria-label="Zvýšit množství">
              +
            </button>
          </div>
          <button ref={buttonRef} type="submit" className="btn btn-primary flex-1">
            {added ? "✓ Přidáno do košíku" : "Přidat do košíku"}
          </button>
        </div>

        <DeliveryEstimate leadTimeDays={product.leadTimeDays} />
      </form>

      {bundle && bundleSaving > 0 && (
        <Link href={`/obchod/${bundle.slug}`} className="group mt-4 flex items-center gap-4 rounded-md border border-dashed border-rust/50 p-4 transition hover:border-rust hover:bg-white">
          <span className="chip shrink-0 bg-rust text-white">SET</span>
          <span className="flex-1 text-[0.9375rem]">
            <span className="font-medium">{bundle.name}</span>
            <span className="block text-muted">Ušetříte až {formatPrice(bundleSaving)} oproti nákupu zvlášť.</span>
          </span>
          <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
        </Link>
      )}

      {product.notices && product.notices.length > 0 && (
        <div className="mt-6 space-y-3">
          {product.notices.map((notice) => (
            <Notice key={notice.title} notice={notice} />
          ))}
        </div>
      )}

      <div className="mt-6">
        <Features slug={slug} />
      </div>

      {product.sizeGuide && widthMm > 0 && (
        <div className="mt-8">
          <SizeGuide widthMm={widthMm} heightMm={Math.round((widthMm * 2) / 3)} round={variant.options["Motiv"] === "Strom života"} />
        </div>
      )}

      {/* sticky add-to-cart bar for phones */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur transition-transform duration-200 lg:hidden ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!showBar}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-muted">{variant.label}</p>
            <p className="font-semibold tabular-nums">{formatPrice(variant.price + extra)}</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={addToCart} tabIndex={showBar ? 0 : -1}>
            {added ? "✓ Přidáno" : "Do košíku"}
          </button>
        </div>
      </div>
    </>
  );
}
