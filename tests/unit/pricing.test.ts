import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import { bundlePrice, getVariant } from "@/lib/catalog";
import { priceCart, PricingError } from "@/lib/pricing";

const plate = products.find((p) => p.slug === "grilovaci-plat")!;
const plate800 = plate.variants.find((v) => v.id === "800")!;

describe("priceCart", () => {
  it("prices lines from the catalog and adds pickup shipping for free", () => {
    const cart = priceCart([{ slug: "grilovaci-plat", variantId: "800", quantity: 2 }], "pickup");
    expect(cart.subtotal).toBe(plate800.price * 2);
    expect(cart.shipping).toBe(0);
    expect(cart.total).toBe(plate800.price * 2);
    expect(cart.weightKg).toBeCloseTo(plate800.weightKg * 2, 5);
  });

  it("ignores any price sent by the client", () => {
    const line = { slug: "grilovaci-plat", variantId: "800", quantity: 1, price: 1, unitPrice: 1, total: 1 };
    const cart = priceCart([line], "pickup");
    expect(cart.total).toBe(plate800.price);
  });

  it("charges courier shipping by weight tier", () => {
    const light = priceCart([{ slug: "grilovaci-plat", variantId: "600", quantity: 1 }], "courier"); // 10 kg
    const medium = priceCart([{ slug: "grilovaci-plat", variantId: "800", quantity: 1 }], "courier"); // 17,8 kg
    const heavy = priceCart([{ slug: "grilovaci-plat", variantId: "1000", quantity: 2 }], "courier"); // 74 kg
    expect(light.shipping).toBe(190);
    expect(medium.shipping).toBe(390);
    expect(heavy.shipping).toBe(1490);
  });

  it("rejects unknown products, variants and inquiry-only products", () => {
    expect(() => priceCart([{ slug: "neexistuje", variantId: "x", quantity: 1 }], "pickup")).toThrow(PricingError);
    expect(() => priceCart([{ slug: "grilovaci-plat", variantId: "999", quantity: 1 }], "pickup")).toThrow(PricingError);
    expect(() => priceCart([{ slug: "loga-a-napisy", variantId: "x", quantity: 1 }], "pickup")).toThrow(PricingError);
  });

  it("rejects invalid quantities and unknown delivery methods", () => {
    for (const quantity of [0, -1, 1.5, 21]) {
      expect(() => priceCart([{ slug: "grilovaci-plat", variantId: "800", quantity }], "pickup")).toThrow(PricingError);
    }
    expect(() => priceCart([{ slug: "grilovaci-plat", variantId: "800", quantity: 1 }], "dron")).toThrow(PricingError);
    expect(() => priceCart([], "pickup")).toThrow(PricingError);
  });

  it("validates personalization text", () => {
    const ok = priceCart(
      [{ slug: "nastenna-dekorace", variantId: "strom-1200", quantity: 1, personalization: "  Rodina Novákových  " }],
      "pickup",
    );
    expect(ok.lines[0].personalization).toBe("Rodina Novákových");
    expect(ok.hasPersonalization).toBe(true);
    expect(() =>
      priceCart([{ slug: "nastenna-dekorace", variantId: "strom-1200", quantity: 1, personalization: "x".repeat(41) }], "pickup"),
    ).toThrow(PricingError);
    expect(() =>
      priceCart([{ slug: "grilovaci-plat", variantId: "800", quantity: 1, personalization: "Ahoj" }], "pickup"),
    ).toThrow(PricingError);
  });
});

describe("bundles", () => {
  it("rounds the discounted price down to whole tens", () => {
    expect(bundlePrice(10800, 10)).toBe(9720);
    expect(bundlePrice(10855, 10)).toBe(9760);
  });

  it("is cheaper than the parts and sums their weight", () => {
    const bundle = getVariant("set-ohniste-a-plat", "600-ocel")!.variant;
    const pit = getVariant("skladaci-ohniste", "600-ocel")!.variant;
    const plateVariant = getVariant("grilovaci-plat", "800")!.variant;
    expect(bundle.compareAtPrice).toBe(pit.price + plateVariant.price);
    expect(bundle.price).toBe(bundlePrice(pit.price + plateVariant.price, 10));
    expect(bundle.price).toBeLessThan(bundle.compareAtPrice!);
    expect(bundle.weightKg).toBeCloseTo(pit.weightKg + plateVariant.weightKg, 5);
  });
});
