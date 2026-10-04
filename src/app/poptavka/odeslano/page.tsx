import type { Metadata } from "next";
import Link from "next/link";
import { isDemo } from "@/lib/site";

export const metadata: Metadata = { title: "Poptávka odeslána", robots: { index: false } };

export default function InquirySentPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <p className="eyebrow">Poptávka</p>
      <h1 className="mt-3 text-display-sm md:text-display">Děkujeme, poptávku máme</h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        {isDemo
          ? "Toto je ukázka – poptávka se nikam neodeslala. V ostrém provozu by vám teď přišel potvrzovací e-mail."
          : "Potvrzení jsme vám poslali e-mailem. Do dvou pracovních dnů se ozveme s cenovou nabídkou nebo doplňujícími otázkami."}
      </p>
      <Link href="/obchod" className="btn btn-outline mt-10">
        Zpět do obchodu
      </Link>
    </div>
  );
}
