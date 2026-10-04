import Link from "next/link";
import { settings } from "@/content/settings";
import { Logo } from "./Header";

const columns = [
  {
    title: "Obchod",
    links: [
      { href: "/obchod", label: "Všechny výrobky" },
      { href: "/obchod/skladaci-ohniste", label: "Skládací ohniště" },
      { href: "/obchod/grilovaci-plat", label: "Grilovací pláty" },
      { href: "/obchod/nastenna-dekorace", label: "Nástěnné dekorace" },
      { href: "/poptavka", label: "Loga a nápisy na míru" },
    ],
  },
  {
    title: "Nákup",
    links: [
      { href: "/kosik", label: "Košík" },
      { href: "/obchodni-podminky", label: "Obchodní podmínky" },
      { href: "/vraceni-zbozi", label: "Vrácení zboží" },
      { href: "/reklamace", label: "Reklamace" },
    ],
  },
  {
    title: "Informace",
    links: [
      { href: "/o-nas", label: "O nás a kontakt" },
      { href: "/ochrana-osobnich-udaju", label: "Ochrana osobních údajů" },
      { href: "/cookies", label: "Cookies" },
      { href: "/zdroje-fotografii", label: "Zdroje fotografií" },
    ],
  },
];

export function Footer() {
  const { seller, social } = settings;
  return (
    <footer className="mt-28 bg-night text-night-muted">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo className="text-xl text-white" />
          <p className="mt-4 max-w-xs text-[0.9375rem]">{settings.tagline}. Navrženo a vyřezáno v Česku.</p>
          {social.instagram && (
            <a href={social.instagram} className="mt-4 inline-block text-white underline underline-offset-4 hover:text-rust-light">
              Instagram
            </a>
          )}
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="md:col-span-2">
            <p className="eyebrow !text-night-muted">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-night-line">
        <div className="container-page flex flex-col gap-2 py-6 font-mono text-xs uppercase tracking-wider sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {seller.name || settings.shopName}
            {seller.ico && ` · IČO ${seller.ico}`}
          </p>
          <p>Platba převodem · QR platba</p>
        </div>
      </div>
    </footer>
  );
}
