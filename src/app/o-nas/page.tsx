import type { Metadata } from "next";
import Image from "next/image";
import { settings } from "@/content/settings";
import { Placeholder } from "@/components/LegalPage";
import { asset } from "@/lib/site";

export const metadata: Metadata = {
  title: "O nás a kontakt",
  description: `Malá dílna s CNC laserem. ${settings.tagline}.`,
  alternates: { canonical: "/o-nas" },
};

export default function AboutPage() {
  const { seller } = settings;
  return (
    <div className="container-page py-12 md:py-16">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="eyebrow">O nás</p>
          <h1 className="mt-3 text-display">Malá dílna, přesný laser</h1>
          <div className="mt-6 space-y-4 text-lg text-muted">
            <p>
              Jsme malá česká dílna s CNC laserem. Řežeme ploché díly z oceli, corten oceli, nerezu a hliníku – často ze
              zbytkového plechu, který by jinak skončil ve šrotu.
            </p>
            <p>
              Nic nesvařujeme ani neohýbáme. Každý výrobek je buď jeden přesně vyřezaný díl, nebo sada, která do sebe
              zapadne bez nářadí. Díky tomu je výroba rychlá, poctivá a výrobky vydrží roky venku i doma.
            </p>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-steel lg:col-span-6">
          <Image
            src={asset("/images/workshop.webp")}
            alt="CNC laserový stroj v dílně"
            fill
            preload
            fetchPriority="high"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <section aria-labelledby="contact-title" className="mt-20 border-t border-line pt-12">
        <h2 id="contact-title" className="text-3xl">
          Kontakt
        </h2>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="eyebrow">Adresa dílny</dt>
            <dd className="mt-2">{seller.address || <Placeholder>adresa</Placeholder>}</dd>
          </div>
          <div>
            <dt className="eyebrow">E-mail</dt>
            <dd className="mt-2">
              {seller.email ? (
                <a href={`mailto:${seller.email}`} className="link">
                  {seller.email}
                </a>
              ) : (
                <Placeholder>e-mail</Placeholder>
              )}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Telefon</dt>
            <dd className="mt-2">
              {seller.phone ? (
                <a href={`tel:${seller.phone.replace(/\s/g, "")}`} className="link">
                  {seller.phone}
                </a>
              ) : (
                <Placeholder>telefon</Placeholder>
              )}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Otevírací doba</dt>
            <dd className="mt-2">
              {seller.openingHours.length ? (
                seller.openingHours.map((line) => <p key={line}>{line}</p>)
              ) : (
                <>
                  <p>Po domluvě</p>
                  <p className="text-sm text-muted">Osobní odběr vždy po předchozí dohodě.</p>
                </>
              )}
            </dd>
          </div>
        </dl>
        {(seller.name || seller.ico) && (
          <p className="mt-10 text-sm text-muted">
            {seller.name}
            {seller.ico && `, IČO ${seller.ico}`}
            {seller.dic && `, DIČ ${seller.dic}`}
          </p>
        )}
      </section>
    </div>
  );
}
