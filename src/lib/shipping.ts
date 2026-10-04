import { settings, type ShippingMethod } from "@/content/settings";

export function getShippingMethod(id: string): ShippingMethod | undefined {
  return settings.shipping.methods.find((m) => m.id === id);
}

export function shippingPrice(method: ShippingMethod, weightKg: number): number {
  const rate = method.rates.find((r) => weightKg <= r.maxKg) ?? method.rates[method.rates.length - 1];
  return rate.price;
}
