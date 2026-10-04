import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Cookies", alternates: { canonical: "/cookies" } };

// Placeholder text. Must be reviewed by a lawyer before going live (see README).
export default function CookiesPage() {
  return (
    <LegalPage title="Cookies">
      <p>
        Tento web nepoužívá reklamní ani analytické cookies a nesleduje vás. Proto po vás nechceme souhlas s cookies.
      </p>
      <p>
        Obsah košíku ukládáme pouze ve vašem prohlížeči (localStorage), aby se neztratil při přechodu mezi stránkami.
        Tato data se nikam neodesílají, dokud neodešlete objednávku.
      </p>
    </LegalPage>
  );
}
