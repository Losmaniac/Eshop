import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Zdroje fotografií", robots: { index: false } };

// Temporary stock photos used until the shop has its own product photos.
// Remove entries from this list (and the page link in Footer.tsx) once the
// images are replaced.
const credits = [
  { file: "hero.webp", title: "Laserkop van Amada FO-4020NT", author: "Contour", license: "CC0 1.0", url: "https://commons.wikimedia.org/wiki/File:Laserkop_van_Amada_FO-4020NT_4kW,_industri%C3%ABle_laser.jpg" },
  { file: "laser-cutting.webp", title: "Laserschmelzschneiden von Edelstahlblech", author: "EGU-Metall", license: "CC BY-SA 3.0", url: "https://commons.wikimedia.org/wiki/File:Laserschmelzschneiden_von_Edelstahlblech.jpg" },
  { file: "workshop.webp", title: "CNC Laser Cutting Machine", author: "S zillayali", license: "CC BY 3.0", url: "https://commons.wikimedia.org/wiki/File:CNC_Laser_Cutting_Machine.jpg" },
  { file: "fire-pit.webp", title: "Fire bowl whilst listening to The Egg", author: "Smoobs", license: "CC BY 2.0", url: "https://www.flickr.com/photos/43541636@N00/471645880" },
  { file: "corten-wall.webp, corten-wall-2.webp", title: "Plania, Mur mémoire Cartier-Roberval", author: "art_inthecity", license: "CC BY 2.0", url: "https://www.flickr.com/photos/57286185@N04/7965617288" },
  { file: "wall-art-silhouettes.webp", title: "Metal silhouettes of Romanies Corbett, Samuel Coleridge Taylor and Dame Peggy Ashcroft", author: "rjw1", license: "CC BY-SA 2.0", url: "https://www.flickr.com/photos/48524258@N00/9115361715" },
  { file: "plasma-cutting.webp", title: "CNC", author: "anaktaro", license: "CC BY 2.0", url: "https://www.flickr.com/photos/35625265@N07/3474748481" },
];

export default function CreditsPage() {
  return (
    <LegalPage title="Zdroje fotografií">
      <p>Do doby, než pořídíme vlastní fotografie výrobků, používáme ilustrační fotografie s volnou licencí:</p>
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
