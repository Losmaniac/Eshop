"use client";

import Link from "next/link";
import { CartLines, useCartSubtotal } from "@/components/cart/CartLines";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";

export function CartPage() {
  const { lines, loaded } = useCart();
  const subtotal = useCartSubtotal();

  if (!loaded) return <div className="min-h-64" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="mt-8">
        <p className="text-lg text-muted">Košík je zatím prázdný.</p>
        <Link href="/obchod" className="btn btn-outline mt-6">
          Prohlédnout obchod
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <CartLines />
      </div>
      <aside className="lg:col-span-4">
        <div className="rounded-sm border border-line bg-white p-6">
          <div className="flex items-baseline justify-between">
            <span>Mezisoučet</span>
            <span className="text-xl font-medium tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-2 text-sm text-muted">Cenu dopravy uvidíte v pokladně podle hmotnosti a způsobu doručení.</p>
          <Link href="/pokladna" className="btn btn-primary mt-6 w-full">
            Pokračovat k objednávce
          </Link>
          <Link href="/obchod" className="link mt-4 block text-center text-[0.9375rem]">
            Pokračovat v nákupu
          </Link>
        </div>
      </aside>
    </div>
  );
}
