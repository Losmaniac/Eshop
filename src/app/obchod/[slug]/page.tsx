import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { settings } from "@/content/settings";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { AccordionItem } from "@/components/product/Accordion";
import { ProductView } from "@/components/product/ProductView";
import { SpecTable } from "@/components/product/SpecTable";
import { catalog, getProduct, relatedProducts } from "@/lib/catalog";
import { formatPrice, formatWorkingDays } from "@/lib/format";
import { asset } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/obchod/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/obchod/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.slice(0, 1).map((i) => ({ url: asset(i.src), alt: i.alt })),
    },
  };
}

export default async function ProductPage(props: PageProps<"/obchod/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const specs: [string, string][] = [
    ["Materiál", product.material],
    ["Tloušťka", product.thickness],
  ];
  if (product.variants.length === 1) specs.push(["Rozměry", product.variants[0].dimensions]);
  if (product.variants.length > 1) {
    specs.push(["Rozměry", product.variants.map((v) => v.dimensions).filter((d, i, all) => all.indexOf(d) === i).join(" / ")]);
  }
  specs.push(["Výroba", formatWorkingDays(product.leadTimeDays)]);

  const jsonLd =
    product.orderType === "cart"
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.shortDescription,
          image: product.images.map((i) => new URL(asset(i.src), siteUrl).toString()),
          material: product.material,
          brand: { "@type": "Brand", name: settings.shopName },
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "CZK",
            lowPrice: Math.min(...product.variants.map((v) => v.price)),
            highPrice: Math.max(...product.variants.map((v) => v.price)),
            offerCount: product.variants.length,
            availability: "https://schema.org/MadeToOrder",
          },
        }
      : {
          "@context": "https://schema.org",
          "@type": "Service",
          name: product.name,
          description: product.shortDescription,
          provider: { "@type": "Organization", name: settings.shopName },
          areaServed: "CZ",
        };

  const related = relatedProducts(product.slug);
  const courier = settings.shipping.methods.find((m) => m.id === "courier");

  return (
    <div className="container-page py-6 md:py-10">
      <JsonLd data={jsonLd} />
      <nav aria-label="Drobečková navigace" className="mb-6 font-mono text-xs uppercase tracking-wider text-muted">
        <Link href="/obchod" className="hover:text-rust-dark">
          Obchod
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <ProductView slug={product.slug} />

      <div className="mt-20 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="sr-only">Podrobnosti</h2>
          <div className="border-t border-line">
            <AccordionItem title="Popis" open>
              <div className="space-y-4">
                {product.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </AccordionItem>
            <AccordionItem title="Parametry">
              <SpecTable rows={specs} />
            </AccordionItem>
            {product.care && product.care.length > 0 && (
              <AccordionItem title="Péče a použití">
                <ul className="space-y-3">
                  {product.care.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span aria-hidden="true" className="mt-3 h-px w-3 shrink-0 bg-rust" />
                      {line}
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            )}
            <AccordionItem title="Doprava a platba">
              <ul className="space-y-2">
                <li>Osobní odběr v dílně zdarma, po domluvě.</li>
                {courier && (
                  <li>
                    Kurýr po ČR od {formatPrice(courier.rates[0].price)} podle hmotnosti. Velké kusy posíláme na paletě.
                  </li>
                )}
                <li>Platba převodem nebo QR kódem. Výrobu zahájíme po připsání platby.</li>
              </ul>
            </AccordionItem>
          </div>
        </div>
      </div>

      <section aria-labelledby="related-title" className="mt-24">
        <div className="flex items-end justify-between gap-4">
          <h2 id="related-title" className="text-3xl">
            Mohlo by se vám líbit
          </h2>
          <Link href="/obchod" className="link text-[0.9375rem]">
            Celý obchod
          </Link>
        </div>
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
