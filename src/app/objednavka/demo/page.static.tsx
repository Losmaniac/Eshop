import type { Metadata } from "next";
import { DemoOrder } from "./DemoOrder";

// Only routed in the static demo build (GitHub Pages), see next.config.ts.

export const metadata: Metadata = { title: "Objednávka", robots: { index: false, follow: false } };

export default function DemoOrderPage() {
  return <DemoOrder />;
}
