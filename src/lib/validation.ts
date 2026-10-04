import { z } from "zod";

// Shared by the forms (client) and the API routes (server). The server always
// validates again; client validation is only for faster feedback.

const required = (message: string) => z.string().trim().min(1, message);

export const cartLineSchema = z.object({
  slug: z.string().min(1).max(100),
  variantId: z.string().min(1).max(100),
  quantity: z.number().int().min(1).max(20),
  personalization: z.string().max(200).optional(),
});

export const checkoutSchema = z
  .object({
    name: required("Vyplňte jméno a příjmení.").max(100),
    email: z.string().trim().email("Zadejte platný e-mail.").max(200),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9 ]{9,16}$/, "Zadejte telefon, např. +420 777 123 456."),
    company: z.string().trim().max(100).optional(),
    deliveryMethod: z.string().min(1, "Vyberte způsob doručení."),
    street: z.string().trim().max(150).optional(),
    city: z.string().trim().max(100).optional(),
    zip: z.string().trim().max(10).optional(),
    note: z.string().trim().max(1000).optional(),
    consentTerms: z.literal(true, { error: "Bez souhlasu s obchodními podmínkami nelze objednat." }),
    consentCustom: z.boolean().optional(),
    items: z.array(cartLineSchema).min(1, "Košík je prázdný.").max(30),
    website: z.string().max(0).optional(), // honeypot, must stay empty
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "courier") {
      if (!data.street) ctx.addIssue({ code: "custom", path: ["street"], message: "Vyplňte ulici a číslo popisné." });
      if (!data.city) ctx.addIssue({ code: "custom", path: ["city"], message: "Vyplňte město." });
      if (!data.zip || !/^\d{3} ?\d{2}$/.test(data.zip)) {
        ctx.addIssue({ code: "custom", path: ["zip"], message: "Zadejte PSČ ve tvaru 123 45." });
      }
    }
    if (data.items.some((i) => i.personalization?.trim()) && data.consentCustom !== true) {
      ctx.addIssue({
        code: "custom",
        path: ["consentCustom"],
        message: "Potvrďte prosím, že berete na vědomí podmínky pro personalizované zboží.",
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const INQUIRY_FILE_TYPES = ["svg", "dxf", "ai", "pdf", "png"] as const;
export const INQUIRY_MAX_FILES = 3;
export const INQUIRY_MAX_FILE_BYTES = 10 * 1024 * 1024;

export const inquirySchema = z.object({
  name: required("Vyplňte jméno a příjmení.").max(100),
  email: z.string().trim().email("Zadejte platný e-mail.").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?[0-9 ]{9,16})?$/, "Zadejte telefon, např. +420 777 123 456.")
    .optional(),
  company: z.string().trim().max(100).optional(),
  projectType: required("Vyberte typ projektu.").max(100),
  material: z.string().trim().max(100).optional(),
  dimensions: z.string().trim().max(200).optional(),
  deadline: z.string().trim().max(100).optional(),
  description: required("Popište prosím, co potřebujete.").max(5000),
  consentPrivacy: z.literal(true, { error: "Potřebujeme váš souhlas se zpracováním údajů, abychom vám mohli odpovědět." }),
  website: z.string().max(0).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const projectTypes = [
  "Logo nebo nápis na fasádu",
  "Logo na recepci / do interiéru",
  "Cedule nebo orientační systém",
  "Dekorace na míru",
  "Jiné",
];

export const materialOptions = ["Nerez", "Hliník", "Ocel (lakovaná)", "Corten", "Nevím, poraďte mi"];

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

/** Returns an error message, or null when the file is acceptable. Checks name and size only. */
export function checkInquiryFile(file: { name: string; size: number }): string | null {
  const ext = fileExtension(file.name);
  if (!(INQUIRY_FILE_TYPES as readonly string[]).includes(ext)) {
    return `Soubor ${file.name} má nepodporovaný formát. Povolené jsou SVG, DXF, AI, PDF a PNG.`;
  }
  if (file.size > INQUIRY_MAX_FILE_BYTES) return `Soubor ${file.name} je větší než 10 MB.`;
  if (file.size === 0) return `Soubor ${file.name} je prázdný.`;
  return null;
}

/** Light content check so a renamed executable is not accepted as a drawing. */
export function looksLikeFileType(ext: string, head: Uint8Array): boolean {
  const text = new TextDecoder("latin1").decode(head);
  switch (ext) {
    case "pdf":
      return text.startsWith("%PDF");
    case "ai":
      return text.startsWith("%PDF") || text.startsWith("%!PS");
    case "png":
      return head[0] === 0x89 && text.slice(1, 4) === "PNG";
    case "svg":
      return /<svg[\s>]/i.test(text);
    case "dxf":
      return text.includes("SECTION") || text.startsWith("AutoCAD Binary DXF");
    default:
      return false;
  }
}

export type FieldErrors = Record<string, string | undefined>;

/** First error message per top-level field. */
export function zodErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
