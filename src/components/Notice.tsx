import type { Notice as NoticeType } from "@/content/products";

export function Notice({ notice }: { notice: NoticeType }) {
  const warning = notice.tone === "warning";
  return (
    <div
      role="note"
      className={`rounded-sm border-l-2 p-4 ${warning ? "border-rust bg-warning-bg" : "border-ink bg-paper-dark"}`}
    >
      <p className="font-medium">{notice.title}</p>
      <p className="mt-1 text-[0.9375rem]">{notice.text}</p>
    </div>
  );
}
