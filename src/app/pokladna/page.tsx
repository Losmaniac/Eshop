import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Steps } from "@/components/Steps";

export const metadata: Metadata = { title: "Pokladna", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <Steps steps={["Košík", "Údaje a doprava", "Platba"]} current={1} label="Postup objednávky" />
      <h1 className="mt-8 text-display">Pokladna</h1>
      <p className="mt-4 max-w-xl text-muted">Bez registrace. Po odeslání uvidíte platební údaje a QR kód.</p>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
