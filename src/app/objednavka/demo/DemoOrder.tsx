"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderConfirmation } from "@/components/order/OrderConfirmation";
import { loadDemoOrder } from "@/lib/demo";
import type { OrderView } from "@/lib/order-types";

export function DemoOrder() {
  const [order, setOrder] = useState<OrderView | null | undefined>(undefined);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage after mount
  useEffect(() => setOrder(loadDemoOrder()), []);

  if (order === undefined) return <div className="min-h-96" aria-busy="true" />;
  if (order === null) {
    return (
      <div className="container-page py-16">
        <h1 className="text-display-sm">Objednávka nenalezena</h1>
        <p className="mt-4 text-muted">V tomto prohlížeči není uložená žádná ukázková objednávka.</p>
        <Link href="/obchod" className="btn btn-outline mt-8">
          Do obchodu
        </Link>
      </div>
    );
  }
  return <OrderConfirmation order={order} demo />;
}
