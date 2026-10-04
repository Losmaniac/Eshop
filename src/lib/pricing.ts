import { getVariant } from "@/lib/catalog";
import { getShippingMethod, shippingPrice } from "@/lib/shipping";

export const MAX_QUANTITY = 20;
export const MAX_LINES = 30;

export type CartLineInput = {
  slug: string;
  variantId: string;
  quantity: number;
  personalization?: string;
};

export type PricedLine = {
  slug: string;
  variantId: string;
  name: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  /** Personalization surcharge per piece. */
  personalizationPrice: number;
  lineTotal: number;
  weightKg: number;
  personalization?: string;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
  weightKg: number;
  deliveryMethod: string;
  deliveryLabel: string;
  hasPersonalization: boolean;
};

export class PricingError extends Error {}

/**
 * Prices a cart from the catalog only. Anything the client sends besides
 * product slug, variant id, quantity and text is ignored, so prices cannot be
 * manipulated from the browser. Used by the server at checkout and by the
 * cart UI for display.
 */
export function priceCart(input: CartLineInput[], deliveryMethodId: string): PricedCart {
  if (input.length === 0) throw new PricingError("Košík je prázdný.");
  if (input.length > MAX_LINES) throw new PricingError("Košík obsahuje příliš mnoho položek.");

  const method = getShippingMethod(deliveryMethodId);
  if (!method) throw new PricingError("Neznámý způsob doručení.");

  const lines = input.map((line): PricedLine => {
    const found = getVariant(line.slug, line.variantId);
    if (!found || found.product.orderType !== "cart") {
      throw new PricingError("Košík obsahuje položku, která už není v nabídce.");
    }
    const { product, variant } = found;
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY) {
      throw new PricingError(`Neplatné množství u položky ${product.name}.`);
    }

    const text = line.personalization?.trim() || undefined;
    if (text && !product.personalization) {
      throw new PricingError(`Položku ${product.name} nelze personalizovat.`);
    }
    if (text && product.personalization && text.length > product.personalization.maxLength) {
      throw new PricingError(`Text u položky ${product.name} je delší než ${product.personalization.maxLength} znaků.`);
    }
    const personalizationPrice = text && product.personalization ? product.personalization.price : 0;
    const unitPrice = variant.price;

    return {
      slug: product.slug,
      variantId: variant.id,
      name: product.name,
      variantLabel: variant.label,
      quantity: line.quantity,
      unitPrice,
      personalizationPrice,
      lineTotal: (unitPrice + personalizationPrice) * line.quantity,
      weightKg: variant.weightKg * line.quantity,
      personalization: text,
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const weightKg = Math.round(lines.reduce((sum, l) => sum + l.weightKg, 0) * 10) / 10;
  const shipping = shippingPrice(method, weightKg);

  return {
    lines,
    subtotal,
    shipping,
    total: subtotal + shipping,
    weightKg,
    deliveryMethod: method.id,
    deliveryLabel: method.label,
    hasPersonalization: lines.some((l) => l.personalization),
  };
}
