import Link from "next/link";
import { settings } from "@/content/settings";
import { CartButton } from "./cart/CartButton";

const nav = [
  { href: "/obchod", label: "Obchod" },
  { href: "/obchod/skladaci-ohniste", label: "Ohniště" },
  { href: "/obchod/nastenna-dekorace", label: "Dekorace" },
  { href: "/poptavka", label: "Loga na míru" },
  { href: "/o-nas", label: "O nás" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="4" fill="currentColor" />
        <path d="M8 23 16 8l8 15" fill="none" stroke="#b4532a" strokeWidth="3" />
        <circle cx="16" cy="19" r="2.2" fill="#f7f5f2" />
      </svg>
      {settings.shopName}
    </span>
  );
}

export function Header() {
  return (
    <>
      <div className="bg-night text-night-muted">
        <p className="container-page flex h-9 items-center justify-center gap-6 overflow-hidden whitespace-nowrap font-mono text-[0.7rem] uppercase tracking-wider">
          <span>Osobní odběr zdarma</span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span className="hidden sm:inline">Výroba do 10 pracovních dnů</span>
          <span className="hidden md:inline" aria-hidden="true">·</span>
          <span className="hidden md:inline">Vyrobeno v Česku</span>
        </p>
      </div>
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/80 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/" className="text-lg" aria-label={`${settings.shopName} – úvod`}>
            <Logo />
          </Link>
          <nav aria-label="Hlavní navigace" className="flex items-center gap-1 sm:gap-3">
            <ul className="hidden items-center gap-1 lg:flex">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="rounded-sm px-3 py-2 text-[0.9375rem] transition hover:bg-paper-dark">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <details className="group relative lg:hidden">
              <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-sm px-3 text-[0.9375rem] hover:bg-paper-dark">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Menu
              </summary>
              <ul className="absolute right-0 top-12 w-60 rounded-md border border-line bg-paper p-2 shadow-lg">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block rounded-sm px-3 py-3 hover:bg-paper-dark">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
            <CartButton />
          </nav>
        </div>
      </header>
    </>
  );
}
