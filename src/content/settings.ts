// Shop-wide settings. Edit this file to change the shop name, seller details,
// shipping prices and personalization. Bank details and emails are set via
// environment variables (see .env.example), not here.

export type ShippingRate = {
  /** Upper weight limit of this tier in kg (inclusive). */
  maxKg: number;
  price: number;
  label?: string;
};

export type ShippingMethod = {
  id: string;
  label: string;
  description: string;
  /** Requires a delivery address. */
  needsAddress: boolean;
  /** Weight-based price tiers, sorted by maxKg. The last tier applies to anything heavier. */
  rates: ShippingRate[];
};

export type Settings = {
  shopName: string;
  tagline: string;
  description: string;
  seller: {
    name: string;
    ico: string;
    dic: string;
    vatPayer: boolean;
    address: string;
    email: string;
    phone: string;
    openingHours: string[];
  };
  social: { instagram: string };
  personalization: { enabled: boolean };
  paymentDueDays: number;
  shipping: { methods: ShippingMethod[] };
};

export const settings: Settings = {
  shopName: "Ocel & Laser",
  tagline: "Laserem řezané výrobky z oceli, corten a nerezu",
  description:
    "Ploché díly a skládací sady řezané laserem z oceli, corten oceli a nerezu. Ohniště, grilovací pláty, nástěnné dekorace a firemní loga na míru. Vyrobeno v Česku.",

  // Seller details for legal pages, emails and the contact page.
  // Empty values are shown as placeholders until filled in.
  seller: {
    name: "",
    ico: "",
    dic: "",
    vatPayer: false,
    address: "",
    email: "",
    phone: "",
    openingHours: [],
  },

  social: {
    instagram: "",
  },

  // Personalization (engraved / cut custom text). Turn it off globally here,
  // or configure it per product in content/products.ts.
  personalization: {
    enabled: true,
  },

  // Payment due period in days, used when PAYMENT_DUE_DAYS is not set.
  paymentDueDays: 7,

  shipping: {
    methods: [
      {
        id: "pickup",
        label: "Osobní odběr v dílně",
        description: "Zdarma. Po dokončení vás kontaktujeme a domluvíme termín.",
        needsAddress: false,
        rates: [{ maxKg: Infinity, price: 0 }],
      },
      {
        id: "courier",
        label: "Kurýr po ČR",
        description: "Doručení na adresu do 1–3 pracovních dnů od expedice. Cena podle hmotnosti.",
        needsAddress: true,
        rates: [
          { maxKg: 10, price: 190 },
          { maxKg: 31.5, price: 390 },
          { maxKg: 60, price: 890 },
          { maxKg: Infinity, price: 1490, label: "paletová přeprava" },
        ],
      },
    ],
  },
};
