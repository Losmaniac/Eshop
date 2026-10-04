import Image from "next/image";
import Link from "next/link";
import { settings } from "@/content/settings";
import { HowItWorks } from "@/components/HowItWorks";
import { ProductCard } from "@/components/ProductCard";
import { TrustStrip } from "@/components/TrustStrip";
import { catalog } from "@/lib/catalog";
import { asset } from "@/lib/site";

export default function HomePage() {
  const featured = catalog.filter((p) => !p.isBundle).slice(0, 4);
  return (
    <>
      <section className="container-page grid gap-10 pb-16 pt-10 md:pt-16 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-5 lg:pb-6">
          <p className="eyebrow">Laserem řezaná ocel</p>
          <h1 className="mt-4 text-display-sm md:text-display">Kov, který vydrží generace</h1>
          <p className="mt-5 max-w-md text-lg text-muted">
            Ohniště, grilovací pláty, nástěnné dekorace a firemní loga. Přesně vyřezané z jednoho plechu, bez svarů.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/obchod" className="btn btn-primary">
              Prohlédnout obchod
            </Link>
            <Link href="/poptavka" className="btn btn-outline">
              Logo na míru
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-steel lg:col-span-7">
          <Image
            src={asset("/images/hero.webp")}
            alt="Laserová hlava řeže ocelový plech, kolem létají jiskry"
            fill
            preload
            fetchPriority="high"
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section aria-labelledby="products-title" className="container-page pb-20">
        <div className="flex items-end justify-between gap-4">
          <h2 id="products-title" className="text-3xl md:text-4xl">
            Výrobky
          </h2>
          <Link href="/obchod" className="link text-[0.9375rem]">
            Celý obchod
          </Link>
        </div>
        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <TrustStrip />

      <div className="py-20">
        <HowItWorks />
      </div>

      <section className="container-page">
        <div className="grid overflow-hidden rounded-sm bg-steel text-white md:grid-cols-2">
          <div className="p-8 md:p-12">
            <p className="eyebrow !text-[#a9a59f]">Pro firmy</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Logo na fasádu nebo recepci</h2>
            <p className="mt-4 max-w-md text-[#d6d3ce]">
              Pošlete nám vektorový soubor a do dvou pracovních dnů dostanete nezávaznou cenovou nabídku.
            </p>
            <Link href="/poptavka" className="btn btn-primary mt-8">
              Poptat realizaci
            </Link>
          </div>
          <div className="relative min-h-64">
            <Image
              src={asset("/images/corten-wall.webp")}
              alt="Laserem vyřezaný nápis v corten stěně"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <p className="sr-only">{settings.description}</p>
      </section>
    </>
  );
}
