import { isDemo } from "@/lib/site";

export function DemoBanner() {
  if (!isDemo) return null;
  return (
    <div className="bg-ink px-4 py-2 text-center text-sm text-white">
      Ukázková verze obchodu. Objednávky ani poptávky se nikam neodesílají a nic neplaťte.
    </div>
  );
}
