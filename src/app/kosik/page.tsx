import type { Metadata } from "next";
import { CartPage } from "./CartPage";

export const metadata: Metadata = { title: "Košík", robots: { index: false } };

export default function Page() {
  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="text-display">Košík</h1>
      <CartPage />
    </div>
  );
}
