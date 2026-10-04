import {
  checkInquiryFile,
  fileExtension,
  INQUIRY_MAX_FILES,
  inquirySchema,
  looksLikeFileType,
  zodErrors,
} from "@/lib/validation";
import { config } from "@/server/config";
import { sendEmail } from "@/server/email";
import { inquiryConfirmationEmail, newInquiryOwnerEmail } from "@/server/email-templates";
import { createInquiry } from "@/server/inquiries";
import { clientIp, rateLimit } from "@/server/rate-limit";

function text(form: FormData, name: string): string | undefined {
  const value = form.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(request: Request) {
  if (!rateLimit(`inquiry:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return Response.json({ error: "Příliš mnoho pokusů. Zkuste to prosím za pár minut." }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "Neplatný formulář." }, { status: 400 });

  const parsed = inquirySchema.safeParse({
    name: text(form, "name") ?? "",
    email: text(form, "email") ?? "",
    phone: text(form, "phone"),
    company: text(form, "company"),
    projectType: text(form, "projectType") ?? "",
    material: text(form, "material"),
    dimensions: text(form, "dimensions"),
    deadline: text(form, "deadline"),
    description: text(form, "description") ?? "",
    consentPrivacy: form.get("consentPrivacy") === "true",
    website: (form.get("website") as string | null) ?? "",
  });
  if (!parsed.success) return Response.json({ fieldErrors: zodErrors(parsed.error.issues) }, { status: 400 });
  if (parsed.data.website) return Response.json({ error: "Poptávku se nepodařilo odeslat." }, { status: 400 });

  const uploads = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (uploads.length > INQUIRY_MAX_FILES) {
    return Response.json({ fieldErrors: { files: `Můžete přiložit nejvýše ${INQUIRY_MAX_FILES} soubory.` } }, { status: 400 });
  }
  const files: { filename: string; content: Uint8Array }[] = [];
  for (const upload of uploads) {
    const error = checkInquiryFile(upload);
    if (error) return Response.json({ fieldErrors: { files: error } }, { status: 400 });
    const content = new Uint8Array(await upload.arrayBuffer());
    if (!looksLikeFileType(fileExtension(upload.name), content.subarray(0, 1024))) {
      return Response.json(
        { fieldErrors: { files: `Soubor ${upload.name} neodpovídá svému formátu.` } },
        { status: 400 },
      );
    }
    const filename = upload.name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120);
    files.push({ filename, content });
  }

  const stored = await createInquiry(parsed.data, files);

  try {
    await sendEmail({ to: parsed.data.email, replyTo: config.ownerEmail || undefined, ...inquiryConfirmationEmail(parsed.data) });
    if (config.ownerEmail) {
      await sendEmail({
        to: config.ownerEmail,
        replyTo: parsed.data.email,
        ...newInquiryOwnerEmail(parsed.data, stored.files, config.siteUrl),
      });
    }
  } catch (error) {
    console.error("[inquiries] email failed", error);
  }

  return Response.json({ ok: true });
}
