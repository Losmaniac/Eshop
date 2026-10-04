import { getInquiryFile } from "@/server/inquiries";

// Download link for files attached to an inquiry. The token is long and
// random; it is only ever sent to the owner by email.
export async function GET(_request: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const file = await getInquiryFile(token);
  if (!file) return new Response("Soubor nenalezen", { status: 404 });

  return new Response(file.content, {
    headers: {
      // Always download, never render (an SVG could contain scripts).
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
