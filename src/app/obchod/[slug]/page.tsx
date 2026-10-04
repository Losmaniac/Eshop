import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { settings } from "@/content/settings";
import { JsonLd } from "@/components/JsonLd";
import { Notice } from "@/components/Notice";
import { AddToCart } from "@/components/product/AddToCart";
import { Gallery } from "@/components/product/Gallery";
import { SpecTable } from "@/components/product/SpecTable";
import { catalog, getProduct, lowestPrice } from "@/lib/catalog";
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
  const price = lowestPrice(product);
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

  return (
    <div className="container-page py-8 md:py-12">
      <JsonLd data={jsonLd} />
      <nav aria-label="Drobečková navigace" className="text-sm text-muted">
        <Link href="/obchod" className="hover:text-rust-dark">
          Obchod
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <Gallery images={product.images} name={product.name} />
        </div>

        <div className="lg:col-span-5">
          <h1 className="text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-lg text-muted">{product.shortDescription}</p>

          <div className="mt-8">
            {product.orderType === "cart" ? (
              <AddToCart slug={product.slug} />
            ) : (
              <div className="space-y-5">
                {price !== undefined && (
                  <p>
                    <span className="text-3xl font-medium tabular-nums">od {formatPrice(price)}</span>
                    <span className="mt-1 block text-sm text-muted">Cena podle velikosti, materiálu a uchycení.</span>
                  </p>
                )}
                <Link href="/poptavka" className="btn btn-primary w-full">
                  Poptat realizaci
                </Link>
              </div>
            )}
          </div>

          {product.notices && product.notices.length > 0 && (
            <div className="mt-8 space-y-3">
              {product.notices.map((notice) => (
                <Notice key={notice.title} notice={notice} />
              ))}
            </div>
          )}

          {product.features && (
            <ul className="mt-8 space-y-2 text-[0.9375rem]">
              {product.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-rust" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-16 grid gap-12 border-t border-line pt-12 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-labelledby="description-title">
          <h2 id="description-title" className="text-2xl">
            Popis
          </h2>
          <div className="mt-4 max-w-2xl space-y-4">
            {product.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {product.care && product.care.length > 0 && (
            <>
              <h2 className="mt-10 text-2xl">Péče a použití</h2>
              <ul className="mt-4 max-w-2xl space-y-3">
                {product.care.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span aria-hidden="true" className="mt-3 h-px w-3 shrink-0 bg-rust" />
                    {line}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
        <section className="lg:col-span-5" aria-labelledby="specs-title">
          <h2 id="specs-title" className="text-2xl">
            Parametry
          </h2>
          <div className="mt-4">
            <SpecTable rows={specs} />
          </div>
        </section>
      </div>
    </div>
  );
}
