import Image from "next/image";
import Link from "next/link";
import { settings } from "@/content/settings";
import { AccordionItem } from "@/components/product/Accordion";
import { ProductCard } from "@/components/ProductCard";
import { catalog, getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { asset } from "@/lib/site";

const materials = ["Corten ocel", "Černá ocel S235", "Nerez", "Hliník", "Řezáno laserem", "Přesnost ±0,1 mm", "Tloušťka 2–8 mm", "Vyrobeno v Česku"];

const steps = [
  { title: "Vyberete nebo pošlete návrh", text: "Hotový výrobek z obchodu, nebo vlastní logo či výkres ve vektoru." },
  { title: "Vyřežeme laserem", text: "Z jednoho plechu, bez svarů a ohýbání. Přesně na desetiny milimetru." },
  { title: "Pošleme naplocho", text: "Kurýrem po celé ČR, nebo si výrobek vyzvednete v dílně." },
];

const faqs = [
  {
    q: "Jak dlouho trvá výroba?",
    a: "Většinu výrobků vyrobíme do 10 pracovních dnů od připsání platby. Loga a nápisy na míru podle domluvy, obvykle do 3 týdnů.",
  },
  {
    q: "Zrezivějí corten výrobky?",
    a: "Ano, a to je záměr. Corten vytvoří během několika týdnů stabilní rezavou patinu, která ocel chrání před další korozí. První týdny může rez stékat, proto výrobek nevěšte nad světlou omítku bez ochrany.",
  },
  {
    q: "Je grilovací plát bezpečný pro jídlo?",
    a: "Ano. Plát je z černé, nikdy pozinkované oceli S235. Před prvním použitím ho vypálíte s olejem, stejně jako litinovou pánev.",
  },
  {
    q: "Jak se platí?",
    a: "Bankovním převodem. Po odeslání objednávky uvidíte platební údaje i QR kód, který stačí naskenovat v aplikaci banky.",
  },
  {
    q: "Můžu si nechat vyrobit něco vlastního?",
    a: "Určitě. Pošlete nám poptávku s vektorovým souborem nebo skicou a do dvou pracovních dnů se ozveme s cenou.",
  },
];

export default function HomePage() {
  const firePit = getProduct("skladaci-ohniste")!;
  const bundle = getProduct("set-ohniste-a-plat")!;
  const others = catalog.filter((p) => p.slug !== "skladaci-ohniste");

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <Image
          src={asset("/images/products/hero.webp")}
          alt="Ohniště z corten oceli s grilovacím plátem a ohněm večer"
          fill
          preload
          fetchPriority="high"
          sizes="100vw"
          className="-z-10 object-cover object-[70%_50%] opacity-90"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/70 to-transparent" aria-hidden="true" />
        <div className="container-page flex min-h-[34rem] flex-col justify-end pb-14 pt-24 md:min-h-[40rem] md:pb-20">
          <p className="chip w-fit border border-white/20 text-night-muted">Laserem řezaná ocel z Česka</p>
          <h1 className="mt-6 max-w-3xl text-hero">Oheň, ocel a čisté linie.</h1>
          <p className="mt-6 max-w-xl text-lg text-[#d6d1ca]">
            Skládací ohniště, grilovací pláty, dekorace z corten oceli a firemní loga. Každý kus vyřezaný z jednoho plechu,
            bez svarů.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/obchod" className="btn btn-primary">
              Prohlédnout obchod
            </Link>
            <Link href={`/obchod/${bundle.slug}`} className="btn btn-ghost-light">
              Set ohniště + plát −{bundle.discountPercent} %
            </Link>
          </div>
          <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/15 pt-6">
            {[
              ["±0,1 mm", "přesnost řezu"],
              ["až 2 m", "velikost dílu"],
              ["10 dnů", "výroba"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="text-2xl font-semibold tracking-tight md:text-3xl">{value}</dd>
                <dd className="mt-1 font-mono text-xs uppercase tracking-wider text-night-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden border-b border-line bg-paper py-4" aria-hidden="true">
        <div className="marquee">
          {[...materials, ...materials].map((m, i) => (
            <span key={i} className="mx-6 flex items-center gap-6 whitespace-nowrap font-mono text-xs uppercase tracking-wider text-muted">
              {m}
              <span className="h-1 w-1 rounded-full bg-rust" />
            </span>
          ))}
        </div>
      </div>

      {/* Bento */}
      <section aria-labelledby="products-title" className="container-page py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Výrobky</p>
            <h2 id="products-title" className="mt-3 text-display">
              Navrženo pro venek i interiér
            </h2>
          </div>
          <Link href="/obchod" className="btn btn-outline">
            Celý obchod
          </Link>
        </div>
        <div className="mt-12 grid gap-x-6 gap-y-12 lg:grid-cols-12">
          <div className="reveal flex lg:col-span-7 lg:row-span-2 [&>article]:w-full">
            <ProductCard product={firePit} large />
          </div>
          {others.slice(0, 2).map((p) => (
            <div key={p.slug} className="reveal lg:col-span-5">
              <ProductCard product={p} />
            </div>
          ))}
          {others.slice(2).map((p) => (
            <div key={p.slug} className="reveal lg:col-span-6">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* 3D teaser */}
      <section className="bg-paper-dark">
        <div className="container-page grid items-center gap-10 py-20 md:grid-cols-2 md:py-24">
          <div className="reveal relative aspect-[4/3] overflow-hidden rounded-md bg-[#e9e6e1]">
            <Image src={asset("/images/products/set-studio.webp")} alt="Skládací ohniště s grilovacím plátem" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            <span className="chip absolute bottom-4 left-4 bg-night text-white">Interaktivní 3D</span>
          </div>
          <div>
            <p className="eyebrow">Nové</p>
            <h2 className="mt-3 text-display">Prohlédněte si výrobek ve 3D</h2>
            <p className="mt-5 max-w-md text-lg text-muted">
              U každého výrobku si model otočíte ze všech stran a hned vidíte zvolenou velikost i materiál. Žádné překvapení
              po rozbalení.
            </p>
            <Link href={`/obchod/${bundle.slug}`} className="btn btn-dark mt-8">
              Vyzkoušet na setu ohniště
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section aria-labelledby="how-title" className="container-page py-20 md:py-28">
        <p className="eyebrow">Jak to funguje</p>
        <h2 id="how-title" className="mt-3 max-w-2xl text-display">
          Od plechu k hotovému kusu
        </h2>
        <div className="reveal relative mt-12 aspect-[21/9] overflow-hidden rounded-md bg-night">
          <Image src={asset("/images/laser-head.webp")} alt="Laserová hlava řeže ocelový plech" fill sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover" />
        </div>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="reveal card p-6 md:p-8">
              <span className="font-mono text-sm text-rust">0{i + 1}</span>
              <h3 className="mt-6 text-xl">{step.title}</h3>
              <p className="mt-2 text-[0.9375rem] text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* B2B */}
      <section className="container-page">
        <div className="relative isolate grid overflow-hidden rounded-md bg-night text-white md:grid-cols-2">
          <div className="p-8 md:p-14">
            <p className="eyebrow !text-night-muted">Pro firmy</p>
            <h2 className="mt-3 text-display">Logo na fasádu nebo recepci</h2>
            <p className="mt-5 max-w-md text-[#d6d1ca]">
              Nerez, hliník, ocel nebo corten. Pošlete logo a do dvou pracovních dnů dostanete nabídku včetně návrhu uchycení.
            </p>
            <p className="mt-6 font-mono text-sm text-night-muted">od {formatPrice(getProduct("loga-a-napisy")?.priceFrom ?? 10000)}</p>
            <Link href="/poptavka" className="btn btn-primary mt-8">
              Poptat realizaci
            </Link>
          </div>
          <div className="relative min-h-72">
            <Image src={asset("/images/products/sign-stainless.webp")} alt="Logo z broušeného nerezu na fasádě" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="container-page grid gap-10 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-4">
          <p className="eyebrow">Časté dotazy</p>
          <h2 id="faq-title" className="mt-3 text-display">
            Dobré otázky
          </h2>
          <p className="mt-4 text-muted">
            Nenašli jste odpověď?{" "}
            <Link href="/o-nas" className="link">
              Napište nám
            </Link>
            .
          </p>
        </div>
        <div className="border-t border-line md:col-span-8">
          {faqs.map((f) => (
            <AccordionItem key={f.q} title={f.q}>
              {f.a}
            </AccordionItem>
          ))}
        </div>
      </section>
      <p className="sr-only">{settings.description}</p>
    </>
  );
}
