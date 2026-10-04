"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { isDemo } from "@/lib/site";
import {
  checkInquiryFile,
  INQUIRY_FILE_TYPES,
  INQUIRY_MAX_FILES,
  inquirySchema,
  materialOptions,
  projectTypes,
} from "@/lib/validation";
import { Checkbox, Honeypot, SelectField, TextArea, TextField, zodErrors, type FieldErrors } from "@/components/Field";

export function InquiryForm({ defaultProjectType }: { defaultProjectType?: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  function onFiles(list: FileList | null) {
    const selected = Array.from(list ?? []);
    const fileError =
      selected.length > INQUIRY_MAX_FILES
        ? `Můžete přiložit nejvýše ${INQUIRY_MAX_FILES} soubory.`
        : selected.map(checkInquiryFile).find(Boolean) ?? undefined;
    setErrors((e) => ({ ...e, files: fileError }));
    setFiles(fileError ? [] : selected);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => ((form.get(name) as string | null) ?? "").trim() || undefined;
    const payload = {
      name: text("name") ?? "",
      email: text("email") ?? "",
      phone: text("phone"),
      company: text("company"),
      projectType: text("projectType") ?? "",
      material: text("material"),
      dimensions: text("dimensions"),
      deadline: text("deadline"),
      description: text("description") ?? "",
      consentPrivacy: form.get("consentPrivacy") === "on",
      website: (form.get("website") as string) ?? "",
    };
    const parsed = inquirySchema.safeParse(payload);
    if (!parsed.success || errors.files) {
      const found = parsed.success ? {} : zodErrors(parsed.error.issues);
      setErrors({ ...found, files: errors.files });
      document.getElementById(Object.keys(found)[0] ?? "files")?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);

    if (isDemo) {
      router.push("/poptavka/odeslano");
      return;
    }

    const body = new FormData();
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) body.append(key, String(value));
    }
    files.forEach((file) => body.append("files", file));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/inquiries`, { method: "POST", body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(result.fieldErrors ?? { form: result.error ?? "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu." });
        setSubmitting(false);
        return;
      }
      router.push("/poptavka/odeslano");
    } catch {
      setErrors({ form: "Poptávku se nepodařilo odeslat. Zkontrolujte připojení a zkuste to znovu." });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-10">
      <Honeypot />
      <fieldset className="space-y-5">
        <legend className="mb-5 text-2xl font-semibold tracking-tight">Kontakt</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="name" label="Jméno a příjmení" autoComplete="name" error={errors.name} />
          <TextField name="company" label="Firma" optional autoComplete="organization" error={errors.company} />
          <TextField name="email" type="email" label="E-mail" autoComplete="email" error={errors.email} />
          <TextField name="phone" type="tel" label="Telefon" optional autoComplete="tel" error={errors.phone} />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-5 text-2xl font-semibold tracking-tight">Projekt</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            name="projectType"
            label="Typ projektu"
            options={projectTypes}
            placeholder="Vyberte…"
            defaultValue={defaultProjectType ?? ""}
            error={errors.projectType}
          />
          <SelectField
            name="material"
            label="Preferovaný materiál"
            options={materialOptions}
            placeholder="Vyberte…"
            optional
            error={errors.material}
          />
          <TextField
            name="dimensions"
            label="Přibližné rozměry"
            optional
            placeholder="např. 1 500 × 400 mm"
            error={errors.dimensions}
          />
          <TextField name="deadline" label="Termín" optional placeholder="např. do konce listopadu" error={errors.deadline} />
        </div>
        <TextArea
          name="description"
          label="Popis"
          rows={5}
          placeholder="Co potřebujete vyrobit, kam se to bude montovat, kolik kusů…"
          error={errors.description}
        />
        <div>
          <label htmlFor="files" className="field-label">
            Podklady <span className="font-normal text-muted">(nepovinné)</span>
          </label>
          <input
            id="files"
            name="files"
            type="file"
            multiple
            accept={INQUIRY_FILE_TYPES.map((t) => `.${t}`).join(",")}
            onChange={(e) => onFiles(e.target.files)}
            aria-describedby="files-help"
            aria-invalid={errors.files ? true : undefined}
            className="block w-full text-[0.9375rem] file:mr-4 file:cursor-pointer file:rounded-sm file:border file:border-ink file:bg-transparent file:px-4 file:py-2.5 file:font-medium hover:file:border-rust hover:file:text-rust-dark"
          />
          <p id="files-help" className="field-help">
            SVG, DXF, AI, PDF nebo PNG, nejvýše {INQUIRY_MAX_FILES} soubory po 10 MB. Vektorové soubory jsou ideální.
          </p>
          {errors.files && <p className="field-error">{errors.files}</p>}
        </div>
      </fieldset>

      <Checkbox
        name="consentPrivacy"
        error={errors.consentPrivacy}
        label={
          <>
            Souhlasím se zpracováním údajů za účelem vyřízení poptávky podle{" "}
            <Link href="/ochrana-osobnich-udaju" className="link" target="_blank">
              zásad ochrany osobních údajů
            </Link>
            .
          </>
        }
      />

      {errors.form && (
        <p role="alert" className="field-error text-[0.9375rem]">
          {errors.form}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={submitting}>
        {submitting ? "Odesílám…" : "Odeslat poptávku"}
      </button>
    </form>
  );
}
