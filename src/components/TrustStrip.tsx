const items = [
  { title: "Vyrobeno v Česku", text: "Navrhujeme a řežeme ve vlastní dílně." },
  { title: "Plochý řez, žádné svary", text: "Díly do sebe zapadají nebo se jen pověsí." },
  { title: "Nic nepřijde nazmar", text: "Řežeme ze zbytkového i nového plechu: ocel S235, corten, nerez, hliník." },
  { title: "Osobní přístup", text: "Každou objednávku vyřizujeme osobně, ne robot." },
];

export function TrustStrip() {
  return (
    <section aria-label="Proč u nás" className="border-y border-line bg-paper-dark">
      <ul className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.title}>
            <p className="font-medium">{item.title}</p>
            <p className="mt-1 text-[0.9375rem] text-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
