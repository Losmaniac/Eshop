import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SellerContact, SellerIdentity } from "@/components/SellerIdentity";

export const metadata: Metadata = { title: "Ochrana osobních údajů", alternates: { canonical: "/ochrana-osobnich-udaju" } };

// Placeholder text. Must be reviewed by a lawyer before going live (see README).
export default function PrivacyPage() {
  return (
    <LegalPage title="Ochrana osobních údajů">
      <h2>Správce údajů</h2>
      <p>
        Správcem osobních údajů je <SellerIdentity />. Kontakt: <SellerContact />.
      </p>
      <h2>Jaké údaje zpracováváme a proč</h2>
      <ul>
        <li>Jméno, e-mail, telefon a adresu – abychom mohli vyřídit a doručit objednávku (plnění smlouvy).</li>
        <li>Údaje a soubory z poptávkového formuláře – abychom vám mohli připravit nabídku (na základě vašeho souhlasu).</li>
        <li>Účetní doklady – kvůli povinnostem podle zákona o účetnictví.</li>
      </ul>
      <h2>Jak dlouho údaje uchováváme</h2>
      <p>
        Údaje k objednávkám uchováváme po dobu stanovenou zákonem. Poptávky bez navazující objednávky mažeme nejpozději
        po [doba] měsících.
      </p>
      <h2>Komu údaje předáváme</h2>
      <p>Dopravci (pro doručení), poskytovateli e-mailových služeb a hostingu. Údaje neprodáváme.</p>
      <h2>Vaše práva</h2>
      <p>
        Máte právo na přístup ke svým údajům, jejich opravu, výmaz, omezení zpracování, přenositelnost a právo vznést
        námitku. Stížnost můžete podat u Úřadu pro ochranu osobních údajů (www.uoou.cz).
      </p>
    </LegalPage>
  );
}
