"use client";

import { useId, useState } from "react";
import { getProduct, type CatalogVariant } from "@/lib/catalog";
import { formatPrice, formatWeight } from "@/lib/format";
import { MAX_QUANTITY } from "@/lib/pricing";
import { useCart } from "@/components/cart/CartProvider";

function findVariant(variants: CatalogVariant[], wanted: Record<string, string>, changed: string) {
  // Prefer an exact match; otherwise keep the option the user just changed
  // and pick the variant that matches most of the others.
  const score = (v: CatalogVariant) =>
    Object.entries(wanted).reduce((s, [name, value]) => s + (v.options[name] === value ? 1 : 0), 0);
  return variants
    .filter((v) => v.options[changed] === wanted[changed])
    .sort((a, b) => score(b) - score(a))[0];
}

export function AddToCart({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const { add } = useCart();
  const [variant, setVariant] = useState<CatalogVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [text, setText] = useState("");
  const id = useId();

  const personalization = product.personalization;
  const extra = text.trim() && personalization ? personalization.price : 0;

  function choose(name: string, value: string) {
    const next = findVariant(product.variants, { ...variant.options, [name]: value }, name);
    if (next) setVariant(next);
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        add({
          slug: product.slug,
          variantId: variant.id,
          quantity,
          personalization: text.trim() || undefined,
        });
        setText("");
        setQuantity(1);
      }}
    >
      {product.optionNames.map((name) => {
        const values = [...new Set(product.variants.map((v) => v.options[name]))];
        return (
          <fieldset key={name}>
            <legend className="field-label">{name}</legend>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const checked = variant.options[name] === value;
                return (
                  <label
                    key={value}
                    className={`relative cursor-pointer rounded-sm border px-4 py-2.5 text-[0.9375rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-rust ${
                      checked ? "border-ink bg-ink text-white" : "border-[#bdb8b1] bg-white hover:border-ink"
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
                    {value}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <div>
        <p className="text-3xl font-medium tabular-nums" aria-live="polite">
          {formatPrice(variant.price + extra)}
        </p>
        {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
          <p className="mt-1 text-[0.9375rem] text-muted">
            Samostatně <s>{formatPrice(variant.compareAtPrice)}</s>{" "}
            <span className="text-rust-dark">– ušetříte {formatPrice(variant.compareAtPrice - variant.price)}</span>
          </p>
        )}
        <p className="mt-1 text-sm text-muted">
          {variant.dimensions} · {formatWeight(variant.weightKg)}
        </p>
      </div>

      {personalization && (
        <div>
          <label htmlFor={`${id}-text`} className="field-label">
            {personalization.label}
            {personalization.price > 0 && (
              <span className="font-normal text-muted"> (+{formatPrice(personalization.price)})</span>
            )}
          </label>
          <input
            id={`${id}-text`}
            className="field-input"
            value={text}
            maxLength={personalization.maxLength}
            onChange={(e) => setText(e.target.value)}
            aria-describedby={`${id}-text-help`}
            autoComplete="off"
          />
          <p id={`${id}-text-help`} className="field-help flex justify-between gap-4">
            <span>{personalization.help}</span>
            <span className="shrink-0 tabular-nums">
              {text.length}/{personalization.maxLength}
            </span>
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <div className="w-24">
          <label htmlFor={`${id}-qty`} className="sr-only">
            Množství
          </label>
          <input
            id={`${id}-qty`}
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_QUANTITY}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(Math.max(Number(e.target.value) || 1, 1), MAX_QUANTITY))}
            className="field-input text-center"
          />
        </div>
        <button type="submit" className="btn btn-primary flex-1">
          Přidat do košíku
        </button>
      </div>
    </form>
  );
}
