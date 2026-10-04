const steps = [
  { title: "Návrh", text: "Vyberete hotový produkt, nebo nám pošlete vlastní výkres. Připravíme data pro řezání." },
  { title: "Řezání laserem", text: "Díly vyřežeme z oceli, corten oceli, nerezu nebo hliníku s přesností na desetiny milimetru." },
  { title: "Doprava", text: "Hotové díly zabalíme naplocho a pošleme kurýrem, nebo si je vyzvednete v dílně." },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="container-page">
      <p className="eyebrow">Jak to funguje</p>
      <h2 id="how-title" className="mt-3 text-3xl md:text-4xl">
        Od návrhu k hotovému dílu
      </h2>
      <ol className="mt-10 grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="border-t border-ink pt-5">
            <span className="font-display text-sm text-muted">0{index + 1}</span>
            <h3 className="mt-2 text-xl">{step.title}</h3>
            <p className="mt-2 text-[0.9375rem] text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
