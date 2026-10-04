import type { Metadata } from "next";
import Image from "next/image";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { getProduct } from "@/lib/catalog";
import { formatPrice, formatWorkingDays } from "@/lib/format";
import { asset } from "@/lib/site";

export const metadata: Metadata = {
  title: "Loga, nápisy a cedule na míru",
  description:
    "Firemní loga, nápisy na fasádu a cedule z nerezu, hliníku, oceli nebo corten oceli. Pošlete podklady a do dvou dnů máte nabídku.",
  alternates: { canonical: "/poptavka" },
};

export default function InquiryPage() {
  const product = getProduct("loga-a-napisy");
  return (
    <div className="container-page py-12 md:py-16">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">Poptávka</p>
          <h1 className="mt-3 text-display-sm md:text-display">Logo nebo nápis na míru</h1>
          <p className="mt-5 text-lg text-muted">
            Logo na fasádu, nápis na recepci nebo cedule u vchodu. Řežeme z nerezu, hliníku, oceli i corten oceli v
            tloušťce 3–5 mm.
          </p>
          <dl className="mt-8 divide-y divide-line border-y border-line text-[0.9375rem]">
            {product?.priceFrom && (
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted">Orientační cena</dt>
                <dd>od {formatPrice(product.priceFrom)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-muted">Nabídka</dt>
              <dd>do 2 pracovních dnů</dd>
            </div>
            {product && (
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted">Výroba</dt>
                <dd>přibližně {formatWorkingDays(product.leadTimeDays)}</dd>
              </div>
            )}
          </dl>
          <div className="relative mt-8 hidden aspect-[4/3] overflow-hidden rounded-sm bg-steel lg:block">
            <Image
              src={asset("/images/laser-cutting.webp")}
              alt="Laserové řezání nerezového plechu"
              fill
              sizes="40vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="lg:col-span-7">
          <InquiryForm defaultProjectType="Logo nebo nápis na fasádu" />
        </div>
      </div>
    </div>
  );
}
