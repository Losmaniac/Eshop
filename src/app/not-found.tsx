import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-20 md:py-28">
      <p className="eyebrow">Chyba 404</p>
      <h1 className="mt-3 text-display-sm md:text-display">Tahle stránka neexistuje</h1>
      <p className="mt-5 max-w-lg text-lg text-muted">
        Možná byla přesunuta, nebo je v adrese překlep. Zkuste to přes obchod nebo úvodní stránku.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/obchod" className="btn btn-primary">
          Do obchodu
        </Link>
        <Link href="/" className="btn btn-outline">
          Na úvod
        </Link>
      </div>
    </div>
  );
}
