import {
  bundles,
  products,
  type Bundle,
  type Notice,
  type Product,
  type Variant,
} from "@/content/products";
import { settings } from "@/content/settings";

export type CatalogVariant = Variant & {
  label: string;
  /** Price before the bundle discount (bundles only). */
  compareAtPrice?: number;
};

export type CatalogProduct = Omit<Product, "variants"> & {
  variants: CatalogVariant[];
  optionNames: string[];
  isBundle: boolean;
  discountPercent?: number;
};

export function variantLabel(options: Record<string, string>): string {
  return Object.values(options).join(" · ");
}

/** Bundle prices are rounded down to whole tens of crowns. */
export function bundlePrice(partsTotal: number, discountPercent: number): number {
  return Math.floor((partsTotal * (1 - discountPercent / 100)) / 10) * 10;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function fromProduct(product: Product): CatalogProduct {
  const personalization = settings.personalization.enabled ? product.personalization : undefined;
  return {
    ...product,
    personalization,
    variants: product.variants.map((v) => ({ ...v, label: variantLabel(v.options) })),
    optionNames: product.variants[0] ? Object.keys(product.variants[0].options) : [],
    isBundle: false,
  };
}

function fromBundle(bundle: Bundle): CatalogProduct {
  const partProducts = unique(bundle.variants.flatMap((v) => v.parts.map((p) => p.product))).map(
    (slug) => {
      const product = products.find((p) => p.slug === slug);
      if (!product) throw new Error(`Bundle ${bundle.slug}: unknown product ${slug}`);
      return product;
    },
  );

  const variants: CatalogVariant[] = bundle.variants.map((bv) => {
    const parts = bv.parts.map((part) => {
      const product = partProducts.find((p) => p.slug === part.product)!;
      const variant = product.variants.find((v) => v.id === part.variant);
      if (!variant) throw new Error(`Bundle ${bundle.slug}: unknown variant ${part.product}/${part.variant}`);
      return { product, variant };
    });
    const partsTotal = parts.reduce((sum, p) => sum + p.variant.price, 0);
    return {
      id: bv.id,
      options: bv.options,
      label: variantLabel(bv.options),
      price: bundlePrice(partsTotal, bundle.discountPercent),
      compareAtPrice: partsTotal,
      weightKg: Math.round(parts.reduce((sum, p) => sum + p.variant.weightKg, 0) * 10) / 10,
      dimensions: parts.map((p) => `${p.product.name.toLowerCase()}: ${p.variant.dimensions}`).join("; "),
      material: unique(parts.map((p) => p.variant.material ?? p.product.material)).join(" + "),
      thickness: unique(parts.map((p) => p.variant.thickness ?? p.product.thickness)).join(" + "),
    };
  });

  const notices: Notice[] = [...(bundle.notices ?? []), ...partProducts.flatMap((p) => p.notices ?? [])];

  return {
    slug: bundle.slug,
    name: bundle.name,
    shortDescription: bundle.shortDescription,
    description: bundle.description,
    orderType: "cart",
    category: bundle.category,
    images: bundle.images,
    material: unique(partProducts.map((p) => p.material)).join(" / "),
    thickness: unique(partProducts.map((p) => p.thickness)).join(" / "),
    variants,
    leadTimeDays: bundle.leadTimeDays,
    features: bundle.features,
    notices,
    care: partProducts.flatMap((p) => p.care ?? []),
    optionNames: bundle.variants[0] ? Object.keys(bundle.variants[0].options) : [],
    isBundle: true,
    discountPercent: bundle.discountPercent,
  };
}

function validate(catalog: CatalogProduct[]): CatalogProduct[] {
  const slugs = new Set<string>();
  for (const product of catalog) {
    if (slugs.has(product.slug)) throw new Error(`Duplicate product slug: ${product.slug}`);
    slugs.add(product.slug);
    const ids = new Set<string>();
    for (const variant of product.variants) {
      if (ids.has(variant.id)) throw new Error(`Duplicate variant id ${product.slug}/${variant.id}`);
      ids.add(variant.id);
      const names = Object.keys(variant.options).join("|");
      if (names !== product.optionNames.join("|")) {
        throw new Error(`Variant ${product.slug}/${variant.id} has different option names than the first variant`);
      }
    }
    if (product.orderType === "cart" && product.variants.length === 0) {
      throw new Error(`Cart product ${product.slug} needs at least one variant`);
    }
  }
  return catalog;
}

export const catalog: CatalogProduct[] = validate([
  ...products.map(fromProduct),
  ...bundles.map(fromBundle),
]);

export function getProduct(slug: string): CatalogProduct | undefined {
  return catalog.find((p) => p.slug === slug);
}

export function getVariant(slug: string, variantId: string) {
  const product = getProduct(slug);
  const variant = product?.variants.find((v) => v.id === variantId);
  return product && variant ? { product, variant } : undefined;
}

export function lowestPrice(product: CatalogProduct): number | undefined {
  if (product.orderType === "inquiry") return product.priceFrom;
  return Math.min(...product.variants.map((v) => v.price));
}
