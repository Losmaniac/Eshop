import type { Metadata } from "next";
import Link from "next/link";
import { settings } from "@/content/settings";
import { LegalPage } from "@/components/LegalPage";
import { SellerContact, SellerIdentity } from "@/components/SellerIdentity";

export const metadata: Metadata = { title: "Obchodní podmínky", alternates: { canonical: "/obchodni-podminky" } };

// Placeholder text. Must be reviewed by a lawyer before going live (see README).
export default function TermsPage() {
  return (
    <LegalPage title="Obchodní podmínky">
      <h2>1. Prodávající</h2>
      <p>
        Prodávajícím je <SellerIdentity />. Kontakt: <SellerContact />.
      </p>
      <h2>2. Objednávka a uzavření smlouvy</h2>
      <p>
        Odesláním objednávky v obchodě {settings.shopName} kupující potvrzuje, že se seznámil s těmito podmínkami.
        Kupní smlouva vzniká doručením potvrzení objednávky na e-mail kupujícího.
      </p>
      <h2>3. Ceny a platba</h2>
      <p>
        Ceny jsou uvedeny v korunách českých a jsou konečné.{" "}
        {settings.seller.vatPayer ? "Ceny zahrnují DPH." : "Prodávající není plátcem DPH."} Platba probíhá bankovním
        převodem na základě platebních údajů uvedených v potvrzení objednávky. Splatnost je {settings.paymentDueDays} dní.
        Výroba začíná po připsání platby na účet prodávajícího.
      </p>
      <h2>4. Dodání</h2>
      <p>
        Zboží vyrábíme na objednávku. Doba výroby je uvedena u každého produktu. Doručujeme kurýrem v rámci České
        republiky, nebo je možný osobní odběr po domluvě.
      </p>
      <h2>5. Odstoupení od smlouvy</h2>
      <p>
        Podmínky odstoupení od smlouvy jsou popsány na stránce <Link href="/vraceni-zbozi" className="link">Vrácení zboží</Link>.
      </p>
      <h2>6. Reklamace</h2>
      <p>
        Postup při reklamaci je popsán na stránce <Link href="/reklamace" className="link">Reklamace</Link>.
      </p>
      <h2>7. Závěrečná ustanovení</h2>
      <p>
        Tyto podmínky jsou platné od [datum]. Mimosoudní řešení spotřebitelských sporů zajišťuje Česká obchodní inspekce
        (www.coi.cz).
      </p>
    </LegalPage>
  );
}
