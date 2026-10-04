import Link from "next/link";
import { settings } from "@/content/settings";
import { CartButton } from "./cart/CartButton";

const nav = [
  { href: "/obchod", label: "Obchod" },
  { href: "/poptavka", label: "Loga na míru" },
  { href: "/o-nas", label: "O nás" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl tracking-tight" aria-label={`${settings.shopName} – úvod`}>
          {settings.shopName}
        </Link>
        <nav aria-label="Hlavní navigace" className="flex items-center gap-1 sm:gap-4">
          <ul className="hidden items-center gap-6 md:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[0.9375rem] hover:text-rust-dark">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <details className="group relative md:hidden">
            <summary className="flex h-11 cursor-pointer list-none items-center px-2 text-[0.9375rem] hover:text-rust-dark [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <ul className="absolute right-0 top-12 w-56 rounded-sm border border-line bg-paper py-2 shadow-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block px-4 py-3 hover:text-rust-dark">
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
  );
}
