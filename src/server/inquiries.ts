import { generateToken } from "@/lib/order-number";
import type { InquiryInput } from "@/lib/validation";
import { db } from "@/server/db";

export type StoredFile = { token: string; filename: string; size: number };

export async function createInquiry(
  input: InquiryInput,
  files: { filename: string; content: Uint8Array }[],
): Promise<{ id: number; files: StoredFile[] }> {
  const client = await db();
  const data = {
    name: input.name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    projectType: input.projectType,
    material: input.material,
    dimensions: input.dimensions,
    deadline: input.deadline,
    description: input.description,
  };
  const tx = await client.transaction("write");
  try {
    const result = await tx.execute({
      sql: "INSERT INTO inquiries (created_at, status, name, email, data) VALUES (?, 'new', ?, ?, ?)",
      args: [new Date().toISOString(), input.name, input.email, JSON.stringify(data)],
    });
    const id = Number(result.lastInsertRowid);
    const stored: StoredFile[] = [];
    for (const file of files) {
      const token = generateToken(24);
      await tx.execute({
        sql: "INSERT INTO inquiry_files (inquiry_id, token, filename, size, content) VALUES (?, ?, ?, ?, ?)",
        args: [id, token, file.filename, file.content.byteLength, file.content],
      });
      stored.push({ token, filename: file.filename, size: file.content.byteLength });
    }
    await tx.commit();
    return { id, files: stored };
  } finally {
    tx.close();
  }
}

export async function getInquiryFile(token: string) {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  const client = await db();
  const result = await client.execute({
    sql: "SELECT filename, content FROM inquiry_files WHERE token = ?",
    args: [token],
  });
  const row = result.rows[0];
  if (!row) return null;
  return { filename: String(row.filename), content: row.content as ArrayBuffer };
}
