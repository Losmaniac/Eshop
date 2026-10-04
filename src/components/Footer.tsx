import Link from "next/link";
import { settings } from "@/content/settings";

const shopLinks = [
  { href: "/obchod", label: "Obchod" },
  { href: "/poptavka", label: "Loga a nápisy na míru" },
  { href: "/o-nas", label: "O nás a kontakt" },
  { href: "/kosik", label: "Košík" },
];

const legalLinks = [
  { href: "/obchodni-podminky", label: "Obchodní podmínky" },
  { href: "/ochrana-osobnich-udaju", label: "Ochrana osobních údajů" },
  { href: "/cookies", label: "Cookies" },
  { href: "/vraceni-zbozi", label: "Vrácení zboží" },
  { href: "/reklamace", label: "Reklamace" },
  { href: "/zdroje-fotografii", label: "Zdroje fotografií" },
];

export function Footer() {
  const { seller, social } = settings;
  return (
    <footer className="mt-24 bg-steel text-[#d6d3ce]">
      <div className="container-page grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-2xl text-white">{settings.shopName}</p>
          <p className="mt-3 max-w-sm text-[0.9375rem]">{settings.tagline}. Navrženo a vyřezáno v Česku.</p>
          {social.instagram && (
            <a href={social.instagram} className="mt-4 inline-block text-white underline underline-offset-4 hover:text-[#e8a07e]">
              Instagram
            </a>
          )}
        </div>
        <nav aria-label="Obchod" className="md:col-span-3">
          <p className="eyebrow !text-[#a9a59f]">Obchod</p>
          <ul className="mt-4 space-y-2 text-[0.9375rem]">
            {shopLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Informace" className="md:col-span-4">
          <p className="eyebrow !text-[#a9a59f]">Informace</p>
          <ul className="mt-4 space-y-2 text-[0.9375rem]">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-[#a9a59f] sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {seller.name || settings.shopName}
            {seller.ico && ` · IČO ${seller.ico}`}
          </p>
          {seller.email && (
            <a href={`mailto:${seller.email}`} className="hover:text-white">
              {seller.email}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
