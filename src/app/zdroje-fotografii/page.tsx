import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Zdroje fotografií", robots: { index: false } };

// Stock photos of laser cutting used on the inquiry, about and home pages.
// Remove entries from this list (and the page link in Footer.tsx) once the
// images are replaced.
const credits = [
  { file: "laser-head.webp", title: "Laserkop van Amada FO-4020NT", author: "Contour", license: "CC0 1.0", url: "https://commons.wikimedia.org/wiki/File:Laserkop_van_Amada_FO-4020NT_4kW,_industri%C3%ABle_laser.jpg" },
  { file: "laser-cutting.webp", title: "Laserschmelzschneiden von Edelstahlblech", author: "EGU-Metall", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Laserschmelzschneiden_von_Edelstahlblech.jpg" },
  { file: "workshop.webp", title: "CNC Laser Cutting Machine", author: "S zillayali", license: "CC BY 3.0", url: "https://commons.wikimedia.org/wiki/File:CNC_Laser_Cutting_Machine.jpg" },
];

export default function CreditsPage() {
  return (
    <LegalPage title="Zdroje fotografií">
      <p>
        Obrázky výrobků jsou vizualizace vytvořené z 3D modelů našich výrobků. Fotografie laserového řezání a dílny jsou
        ilustrační fotografie s volnou licencí:
      </p>
      <ul>
        {credits.map((c) => (
          <li key={c.file}>
            <a href={c.url} className="link" rel="noopener">
              {c.title}
            </a>{" "}
            – {c.author}, {c.license}
          </li>
        ))}
      </ul>
    </LegalPage>
  );
}
