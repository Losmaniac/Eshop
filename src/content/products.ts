// Product catalog. This is the only file you need to edit to add, remove or
// change products. Prices are in CZK including everything the customer pays
// for the item itself (shipping is added at checkout).
//
// Images live in /public/images. The product images are renders of the 3D
// models (scripts/render). Replace them with photos when you have them.

export type OrderType = "cart" | "inquiry";
export type Category = "zahrada" | "interier" | "firmy";

export type ProductImage = {
  src: string;
  alt: string;
  /** Show this image only when the selected variant has these options, e.g. { Motiv: "Mapa Česka" }. */
  match?: Record<string, string>;
};

export type Variant = {
  /** Stable id, used in the cart and in orders. Do not change it once orders exist. */
  id: string;
  /** Selectable options, e.g. { Průměr: "Ø 600 mm" }. Every variant of a product must use the same option names. */
  options: Record<string, string>;
  price: number;
  weightKg: number;
  /** Human-readable dimensions, e.g. "Ø 600 mm, tl. 6 mm". */
  dimensions: string;
  /** Overrides the product material for this variant. */
  material?: string;
  /** Overrides the product thickness for this variant. */
  thickness?: string;
};

export type Personalization = {
  label: string;
  help?: string;
  maxLength: number;
  /** Extra charge per piece in CZK, 0 = free. */
  price: number;
};

export type Notice = {
  tone: "warning" | "info";
  title: string;
  text: string;
};

export type Product = {
  slug: string;
  name: string;
  shortDescription: string;
  /** Paragraphs of the long description. */
  description: string[];
  orderType: OrderType;
  category: Category;
  images: ProductImage[];
  material: string;
  thickness: string;
  variants: Variant[];
  /** Optional custom text. Omit (or set to undefined) to disable for this product. */
  personalization?: Personalization;
  /** Production time in working days. */
  leadTimeDays: number;
  /** Shown for inquiry products instead of a price, e.g. 10000 → "od 10 000 Kč". */
  priceFrom?: number;
  features?: string[];
  notices?: Notice[];
  care?: string[];
  /** Show a size comparison with a person on the product page. */
  sizeGuide?: boolean;
};

export type Bundle = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string[];
  category: Category;
  images: ProductImage[];
  /** Discount off the sum of the parts, in percent. */
  discountPercent: number;
  leadTimeDays: number;
  /** Each bundle variant is made of exactly one variant of each listed product. */
  variants: {
    id: string;
    options: Record<string, string>;
    parts: { product: string; variant: string }[];
  }[];
  features?: string[];
  notices?: Notice[];
};

// --- Wall art: price depends on size, every motif is available in every size.
const wallArtMotifs = [
  { id: "strom", label: "Strom života" },
  { id: "mapa", label: "Mapa Česka" },
  { id: "hory", label: "Silueta hor" },
];
const wallArtSizes = [
  { id: "1200", label: "1 200 mm", dimensions: "1 200 × 800 mm", thickness: "2 mm", price: 6900, weightKg: 7.5 },
  { id: "1600", label: "1 600 mm", dimensions: "1 600 × 1 070 mm", thickness: "2 mm", price: 12900, weightKg: 13.4 },
  { id: "2000", label: "2 000 mm", dimensions: "2 000 × 1 330 mm", thickness: "3 mm", price: 19900, weightKg: 31.3 },
];

export const products: Product[] = [
  {
    slug: "loga-a-napisy",
    name: "Loga, nápisy a cedule na fasádu",
    shortDescription: "Firemní logo nebo nápis z nerezu, hliníku či oceli. Vyrobíme podle vašich podkladů.",
    description: [
      "Logo na fasádu, nápis na recepci nebo cedule u vchodu. Řežeme z nerezu, hliníku, oceli i corten oceli v tloušťce 3–5 mm, s přesností na desetiny milimetru.",
      "Pošlete nám vektorový soubor (SVG, DXF, AI nebo PDF) a krátký popis. Do dvou pracovních dnů se ozveme s cenou a návrhem uchycení – distanční trny, lepení nebo zavěšení.",
    ],
    orderType: "inquiry",
    category: "firmy",
    images: [
      { src: "/images/products/sign-stainless.webp", alt: "Logo z broušeného nerezu na distančních trnech na fasádě" },
      { src: "/images/products/sign-corten.webp", alt: "Logo z corten oceli na tmavé fasádě" },
      { src: "/images/laser-cutting.webp", alt: "Laserové řezání nerezového plechu" },
    ],
    material: "nerez, hliník, ocel, corten",
    thickness: "3–5 mm",
    variants: [],
    leadTimeDays: 15,
    priceFrom: 10000,
    features: [
      "Výroba podle vašeho vektorového souboru",
      "Nerez, hliník, ocel nebo corten",
      "Distanční trny nebo skryté uchycení",
      "Nezávazná cenová nabídka do 2 pracovních dnů",
    ],
  },
  {
    slug: "nastenna-dekorace",
    name: "Velká nástěnná dekorace z corten oceli",
    shortDescription: "Strom života, mapa nebo silueta hor. Panel až 2 metry s vyřezanými otvory pro zavěšení.",
    description: [
      "Velkoformátová dekorace z corten oceli, která časem získá teplou rezavou patinu. Hodí se na fasádu, plot i do interiéru.",
      "Panel je jeden plochý díl, nic se nesvařuje ani neohýbá. Otvory pro zavěšení jsou vyřezané přímo v panelu, stačí dvě až čtyři hmoždinky.",
    ],
    orderType: "cart",
    category: "interier",
    images: [
      { src: "/images/products/wall-strom.webp", alt: "Strom života z corten oceli na stěně nad lavicí", match: { Motiv: "Strom života" } },
      { src: "/images/products/wall-mapa.webp", alt: "Mapa Česka z corten oceli s vyřezanými městy", match: { Motiv: "Mapa Česka" } },
      { src: "/images/products/wall-hory.webp", alt: "Silueta hor z corten oceli na stěně", match: { Motiv: "Silueta hor" } },
    ],
    material: "corten ocel",
    thickness: "2–3 mm",
    variants: wallArtMotifs.flatMap((motif) =>
      wallArtSizes.map((size) => ({
        id: `${motif.id}-${size.id}`,
        options: { Motiv: motif.label, Velikost: size.label },
        price: size.price,
        weightKg: size.weightKg,
        dimensions: size.dimensions,
        thickness: size.thickness,
      })),
    ),
    personalization: {
      label: "Vlastní text (nepovinné)",
      help: "Například jméno rodiny nebo datum. Vyřežeme ho do spodní části panelu.",
      maxLength: 40,
      price: 0,
    },
    leadTimeDays: 10,
    sizeGuide: true,
    features: [
      "Jeden plochý díl, bez svarů",
      "Otvory pro zavěšení vyřezané v panelu",
      "Corten vytvoří ochrannou patinu během několika týdnů venku",
    ],
    care: [
      "Venku se patina vytvoří sama během 4–8 týdnů. Prvních několik týdnů může z panelu stékat rez – nevěšte ho nad světlou omítku nebo dlažbu bez ochrany.",
      "V interiéru doporučujeme panel po vytvoření patiny ošetřit bezbarvým lakem.",
    ],
  },
  {
    slug: "skladaci-ohniste",
    name: "Skládací ohniště",
    shortDescription: "Sada plochých dílů, které do sebe zasunete. Bez šroubů, bez svařování, bez nářadí.",
    description: [
      "Ohniště složené ze čtyř plochých ocelových dílů, které do sebe zapadnou díky přesně vyřezaným drážkám. Složíte ho za pár minut a na zimu zase rozložíte.",
      "Dodáváme naplocho, složíte bez nářadí. Vybrat si můžete klasickou ocel, která zčerná, nebo corten s rezavou patinou.",
    ],
    orderType: "cart",
    category: "zahrada",
    images: [
      { src: "/images/products/pit-corten.webp", alt: "Skládací ohniště z corten oceli", match: { Materiál: "corten" } },
      { src: "/images/products/pit-steel.webp", alt: "Skládací ohniště z oceli", match: { Materiál: "ocel" } },
      { src: "/images/products/pit-fire.webp", alt: "Skládací ohniště s hořícím ohněm večer" },
      { src: "/images/products/pit-flatpack.webp", alt: "Díly ohniště naplocho, jak přijdou v balíku" },
    ],
    material: "ocel S235 nebo corten",
    thickness: "4–5 mm",
    variants: [
      { id: "600-ocel", options: { Velikost: "Ø 600 mm", Materiál: "ocel" }, price: 5900, weightKg: 18.1, dimensions: "Ø 600 mm, výška 400 mm", material: "ocel S235", thickness: "4 mm" },
      { id: "600-corten", options: { Velikost: "Ø 600 mm", Materiál: "corten" }, price: 6900, weightKg: 18.1, dimensions: "Ø 600 mm, výška 400 mm", material: "corten ocel", thickness: "4 mm" },
      { id: "800-ocel", options: { Velikost: "Ø 800 mm", Materiál: "ocel" }, price: 9900, weightKg: 37.7, dimensions: "Ø 800 mm, výška 500 mm", material: "ocel S235", thickness: "5 mm" },
      { id: "800-corten", options: { Velikost: "Ø 800 mm", Materiál: "corten" }, price: 11900, weightKg: 37.7, dimensions: "Ø 800 mm, výška 500 mm", material: "corten ocel", thickness: "5 mm" },
    ],
    leadTimeDays: 10,
    features: [
      "Dodáváme naplocho, složíte bez nářadí",
      "Žádné šrouby ani svary",
      "Na zimu rozložíte a uklidíte",
      "Lze doplnit grilovacím plátem",
    ],
    care: [
      "Ohniště stavějte na nehořlavý podklad (dlažba, štěrk) a v bezpečné vzdálenosti od budov a stromů.",
      "Ocel po prvním zatopení zčerná a časem zrezaví. Jde o přirozený proces, který nemá vliv na funkci.",
    ],
  },
  {
    slug: "grilovaci-plat",
    name: "Grilovací plát na ohniště",
    shortDescription: "Silný ocelový plát s otvorem uprostřed. Položíte ho na ohniště a grilujete po celém obvodu.",
    description: [
      "Kruhový plát z černé oceli S235, který položíte na ohniště. Uprostřed hoří oheň, po obvodu grilujete zeleninu, maso i palačinky. Silný materiál drží teplo a nekroutí se.",
      "Plát je jeden vyřezaný díl. Hodí se na naše skládací ohniště i na většinu běžných ohnišť a kotlů.",
    ],
    orderType: "cart",
    category: "zahrada",
    images: [
      { src: "/images/products/plate-studio.webp", alt: "Kruhový grilovací plát z černé oceli s otvorem uprostřed" },
      { src: "/images/products/plate-fire.webp", alt: "Grilovací plát položený na ohništi s ohněm" },
    ],
    material: "černá ocel S235",
    thickness: "6–8 mm",
    variants: [
      { id: "600", options: { Průměr: "Ø 600 mm" }, price: 2900, weightKg: 10.0, dimensions: "Ø 600 mm, otvor Ø 300 mm", thickness: "6 mm" },
      { id: "800", options: { Průměr: "Ø 800 mm" }, price: 4900, weightKg: 17.8, dimensions: "Ø 800 mm, otvor Ø 400 mm", thickness: "6 mm" },
      { id: "1000", options: { Průměr: "Ø 1 000 mm" }, price: 7900, weightKg: 37.0, dimensions: "Ø 1 000 mm, otvor Ø 500 mm", thickness: "8 mm" },
    ],
    leadTimeDays: 10,
    features: [
      "Černá ocel S235, vhodná pro styk s potravinami",
      "Silný plát drží teplo a nekroutí se",
      "Pasuje na většinu ohnišť a kotlů",
    ],
    notices: [
      {
        tone: "warning",
        title: "Černá ocel, nikdy pozinkovaná",
        text: "Plát je z černé (nepozinkované) oceli, která je bezpečná pro přípravu jídla. Pozinkovaný plech se ke grilování nikdy nepoužívá. Hrana po řezání může být ostrá – před prvním použitím ji doporučujeme lehce přebrousit.",
      },
    ],
    care: [
      "Před prvním použitím plát vypalte: rozpalte ho, potřete tenkou vrstvou oleje s vysokým bodem zakouření a nechte olej zapéct.",
      "Po každém použití plát očistěte stěrkou a potřete olejem.",
      "Časem se vytvoří tmavá patina, která chrání ocel a zlepšuje nepřilnavost.",
    ],
  },
];

export const bundles: Bundle[] = [
  {
    slug: "set-ohniste-a-plat",
    name: "Set ohniště + grilovací plát",
    shortDescription: "Skládací ohniště s grilovacím plátem za zvýhodněnou cenu.",
    description: [
      "Kompletní sestava na grilování na zahradě: skládací ohniště a grilovací plát, který na něj přesně pasuje.",
      "Obě části dodáváme naplocho. Ohniště složíte bez nářadí a plát jen položíte navrch.",
    ],
    category: "zahrada",
    images: [
      { src: "/images/products/set-studio.webp", alt: "Skládací ohniště s grilovacím plátem" },
      { src: "/images/products/hero.webp", alt: "Ohniště s grilovacím plátem a ohněm večer" },
      { src: "/images/products/pit-flatpack.webp", alt: "Díly ohniště naplocho, jak přijdou v balíku" },
    ],
    discountPercent: 10,
    leadTimeDays: 10,
    variants: [
      { id: "600-ocel", options: { Velikost: "ohniště Ø 600 + plát Ø 800 mm", Materiál: "ocel" }, parts: [{ product: "skladaci-ohniste", variant: "600-ocel" }, { product: "grilovaci-plat", variant: "800" }] },
      { id: "600-corten", options: { Velikost: "ohniště Ø 600 + plát Ø 800 mm", Materiál: "corten" }, parts: [{ product: "skladaci-ohniste", variant: "600-corten" }, { product: "grilovaci-plat", variant: "800" }] },
      { id: "800-ocel", options: { Velikost: "ohniště Ø 800 + plát Ø 1 000 mm", Materiál: "ocel" }, parts: [{ product: "skladaci-ohniste", variant: "800-ocel" }, { product: "grilovaci-plat", variant: "1000" }] },
      { id: "800-corten", options: { Velikost: "ohniště Ø 800 + plát Ø 1 000 mm", Materiál: "corten" }, parts: [{ product: "skladaci-ohniste", variant: "800-corten" }, { product: "grilovaci-plat", variant: "1000" }] },
    ],
    features: [
      "Ohniště i plát dodáváme naplocho",
      "Plát přesně pasuje na ohniště",
      "Výhodnější než při nákupu zvlášť",
    ],
  },
];

export const categoryLabels: Record<Category, string> = {
  zahrada: "Zahrada",
  interier: "Interiér a fasáda",
  firmy: "Pro firmy",
};
