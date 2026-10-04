import type { Metadata } from "next";
import { categoryLabels, type Category } from "@/content/products";
import { ProductCard } from "@/components/ProductCard";
import { catalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Obchod",
  description: "Skládací ohniště, grilovací pláty, nástěnné dekorace z corten oceli a loga na míru.",
  alternates: { canonical: "/obchod" },
};

// A category filter only makes sense once there are more than a few products.
const SHOW_CATEGORIES_FROM = 7;

export default function ShopPage() {
  const grouped = catalog.length >= SHOW_CATEGORIES_FROM;
  const categories = [...new Set(catalog.map((p) => p.category))] as Category[];

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="text-display-sm md:text-display">Obchod</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Všechno řežeme laserem z plochého plechu. Ohniště a pláty posíláme naplocho, loga a nápisy vyrábíme na míru.
      </p>

      {grouped ? (
        categories.map((category) => (
          <section key={category} aria-labelledby={`cat-${category}`} className="mt-16">
            <h2 id={`cat-${category}`} className="text-2xl">
              {categoryLabels[category]}
            </h2>
            <div className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {catalog
                .filter((p) => p.category === category)
                .map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
            </div>
          </section>
        ))
      ) : (
        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 3} headingLevel={2} />
          ))}
        </div>
      )}
    </div>
  );
}
