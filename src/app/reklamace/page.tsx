import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SellerContact } from "@/components/SellerIdentity";

export const metadata: Metadata = { title: "Reklamace", alternates: { canonical: "/reklamace" } };

// Placeholder text. Must be reviewed by a lawyer before going live (see README).
export default function ComplaintsPage() {
  return (
    <LegalPage title="Reklamace">
      <p>Na zboží poskytujeme zákonnou záruku 24 měsíců od převzetí.</p>
      <h2>Co není vada</h2>
      <ul>
        <li>Rezavá patina corten oceli a zčernání či koroze běžné oceli – jde o přirozenou vlastnost materiálu.</li>
        <li>Drobné stopy po laserovém řezu a mírně ostré hrany, které lze přebrousit.</li>
        <li>Deformace způsobené nesprávným použitím, například přehřátím plátu bez ohně pod celou plochou.</li>
      </ul>
      <h2>Jak reklamovat</h2>
      <p>
        Napište nám (<SellerContact />), uveďte číslo objednávky, popis vady a přiložte fotografie. Reklamaci vyřídíme
        nejpozději do 30 dnů.
      </p>
    </LegalPage>
  );
}
