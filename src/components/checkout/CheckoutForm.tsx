"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { settings } from "@/content/settings";
import { createDemoOrder } from "@/lib/demo";
import { formatPrice, formatWeight } from "@/lib/format";
import { priceCart, PricingError, type PricedCart } from "@/lib/pricing";
import { isDemo } from "@/lib/site";
import { checkoutSchema } from "@/lib/validation";
import { useCart } from "@/components/cart/CartProvider";
import { Checkbox, Honeypot, TextArea, TextField, zodErrors, type FieldErrors } from "@/components/Field";

export function CheckoutForm() {
  const { lines, loaded, clear } = useCart();
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState(settings.shipping.methods[0].id);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const priced = useMemo((): PricedCart | null => {
    try {
      return lines.length ? priceCart(lines, deliveryMethod) : null;
    } catch {
      return null;
    }
  }, [lines, deliveryMethod]);

  const method = settings.shipping.methods.find((m) => m.id === deliveryMethod)!;

  if (!loaded) return <div className="min-h-96" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="py-8">
        <p className="text-lg text-muted">Košík je prázdný, není co objednat.</p>
        <Link href="/obchod" className="btn btn-outline mt-6">
          Prohlédnout obchod
        </Link>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => (form.get(name) as string | null) ?? undefined;
    const payload = {
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      company: text("company") || undefined,
      deliveryMethod,
      street: text("street"),
      city: text("city"),
      zip: text("zip"),
      note: text("note") || undefined,
      consentTerms: form.get("consentTerms") === "on",
      consentCustom: form.get("consentCustom") === "on",
      items: lines,
      website: text("website") ?? "",
    };

    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const found = zodErrors(parsed.error.issues);
      setErrors(found);
      const first = Object.keys(found)[0];
      document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      if (isDemo) {
        createDemoOrder(parsed.data);
        clear();
        router.push("/objednavka/demo");
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(result.fieldErrors ?? { form: result.error ?? "Objednávku se nepodařilo odeslat. Zkuste to prosím znovu." });
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/objednavka/${result.token}`);
    } catch (error) {
      setErrors({
        form:
          error instanceof PricingError
            ? error.message
            : "Objednávku se nepodařilo odeslat. Zkontrolujte připojení a zkuste to znovu.",
      });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-12 lg:grid-cols-12">
      <Honeypot />
      <div className="space-y-10 lg:col-span-7">
        <fieldset className="space-y-5">
          <legend className="mb-5 font-display text-2xl">Kontaktní údaje</legend>
          <TextField name="name" label="Jméno a příjmení" autoComplete="name" error={errors.name} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="email" type="email" label="E-mail" autoComplete="email" error={errors.email} />
            <TextField name="phone" type="tel" label="Telefon" autoComplete="tel" error={errors.phone} />
          </div>
          <TextField name="company" label="Firma" optional autoComplete="organization" error={errors.company} />
        </fieldset>

        <fieldset>
          <legend className="mb-5 font-display text-2xl">Doručení</legend>
          <div className="space-y-3">
            {settings.shipping.methods.map((m) => {
              const price = priced && m.id === deliveryMethod ? priced.shipping : undefined;
              return (
                <label
                  key={m.id}
                  className={`flex cursor-pointer gap-4 rounded-sm border bg-white p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-rust ${
                    m.id === deliveryMethod ? "border-ink" : "border-line hover:border-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={m.id}
                    checked={m.id === deliveryMethod}
                    onChange={() => setDeliveryMethod(m.id)}
                    className="mt-1 h-4 w-4 accent-[#141414]"
                  />
                  <span className="flex-1">
                    <span className="flex justify-between gap-4 font-medium">
                      {m.label}
                      {price !== undefined && <span className="tabular-nums">{price === 0 ? "zdarma" : formatPrice(price)}</span>}
                    </span>
                    <span className="mt-1 block text-sm text-muted">{m.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {method.needsAddress && (
            <div className="mt-6 space-y-5">
              <TextField name="street" label="Ulice a číslo popisné" autoComplete="street-address" error={errors.street} />
              <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
                <TextField name="city" label="Město" autoComplete="address-level2" error={errors.city} />
                <TextField name="zip" label="PSČ" inputMode="numeric" autoComplete="postal-code" error={errors.zip} />
              </div>
              <p className="text-sm text-muted">Doručujeme pouze v rámci České republiky.</p>
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-5 font-display text-2xl">Poznámka</legend>
          <TextArea name="note" label="Poznámka k objednávce" optional rows={3} error={errors.note} />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="sr-only">Souhlasy</legend>
          <Checkbox
            name="consentTerms"
            error={errors.consentTerms}
            label={
              <>
                Souhlasím s{" "}
                <Link href="/obchodni-podminky" className="link" target="_blank">
                  obchodními podmínkami
                </Link>{" "}
                a beru na vědomí{" "}
                <Link href="/ochrana-osobnich-udaju" className="link" target="_blank">
                  zásady zpracování osobních údajů
                </Link>
                .
              </>
            }
          />
          {priced?.hasPersonalization && (
            <Checkbox
              name="consentCustom"
              error={errors.consentCustom}
              label="Beru na vědomí, že personalizované zboží vyrobené podle mého zadání nelze vrátit ve 14denní lhůtě."
            />
          )}
        </fieldset>
      </div>

      <aside className="lg:col-span-5" aria-labelledby="order-summary-title">
        <div className="rounded-sm border border-line bg-white p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 id="order-summary-title" className="text-2xl">
            Vaše objednávka
          </h2>
          {priced ? (
            <>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {priced.lines.map((line) => (
                  <li key={`${line.slug}-${line.variantId}-${line.personalization ?? ""}`} className="flex justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="leading-snug">{line.name}</p>
                      <p className="text-sm text-muted">
                        {line.variantLabel} · {line.quantity} ks
                      </p>
                      {line.personalization && <p className="text-sm text-muted">Text: „{line.personalization}“</p>}
                    </div>
                    <p className="shrink-0 tabular-nums">{formatPrice(line.lineTotal)}</p>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 text-[0.9375rem]">
                <div className="flex justify-between">
                  <dt className="text-muted">Mezisoučet</dt>
                  <dd className="tabular-nums">{formatPrice(priced.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">
                    Doprava <span className="text-sm">({formatWeight(priced.weightKg)})</span>
                  </dt>
                  <dd className="tabular-nums">{priced.shipping === 0 ? "zdarma" : formatPrice(priced.shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-ink pt-3 text-lg font-medium">
                  <dt>Celkem</dt>
                  <dd className="tabular-nums">{formatPrice(priced.total)}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="mt-4 text-muted">Košík obsahuje neplatné položky. Upravte ho prosím.</p>
          )}
          <p className="mt-4 text-sm text-muted">
            Platba bankovním převodem. Platební údaje a QR kód uvidíte hned po odeslání objednávky.
          </p>
          {errors.form && (
            <p role="alert" className="field-error mt-4 text-[0.9375rem]">
              {errors.form}
            </p>
          )}
          {Object.keys(errors).length > 0 && !errors.form && (
            <p role="alert" className="field-error mt-4 text-[0.9375rem]">
              Zkontrolujte prosím zvýrazněná pole.
            </p>
          )}
          <button type="submit" className="btn btn-primary mt-5 w-full" disabled={submitting || !priced}>
            {submitting ? "Odesílám…" : "Objednat s povinností platby"}
          </button>
        </div>
      </aside>
    </form>
  );
}
