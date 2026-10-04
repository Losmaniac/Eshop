import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SellerContact, SellerIdentity } from "@/components/SellerIdentity";

export const metadata: Metadata = { title: "Vrácení zboží", alternates: { canonical: "/vraceni-zbozi" } };

// Placeholder text. Must be reviewed by a lawyer before going live (see README).
export default function ReturnsPage() {
  return (
    <LegalPage title="Vrácení zboží">
      <p>
        Jako spotřebitel můžete od smlouvy uzavřené přes internet odstoupit bez udání důvodu do 14 dnů od převzetí zboží.
      </p>
      <h2>Výjimka: zboží na míru a personalizované zboží</h2>
      <p>
        Od smlouvy nelze odstoupit u zboží vyrobeného podle vašich požadavků nebo přizpůsobeného vašim osobním potřebám –
        například loga a nápisy na míru nebo dekorace s vlastním textem.
      </p>
      <h2>Jak postupovat</h2>
      <p>
        Odstoupení nám pošlete e-mailem (<SellerContact />) s číslem objednávky. Zboží zašlete nepoškozené na adresu
        prodávajícího (<SellerIdentity />). Peníze vrátíme do 14 dnů od doručení odstoupení, nejdříve však po převzetí
        vráceného zboží. Náklady na vrácení zboží nese kupující.
      </p>
    </LegalPage>
  );
}
