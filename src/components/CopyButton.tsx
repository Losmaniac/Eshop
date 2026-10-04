"use client";

import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Older browsers: fall back to a temporary text field.
      const input = document.createElement("textarea");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-sm border border-line px-2.5 py-1 text-sm text-muted transition-colors hover:border-ink hover:text-ink"
      aria-label={`Kopírovat: ${label}`}
    >
      <span aria-live="polite">{copied ? "Zkopírováno" : "Kopírovat"}</span>
    </button>
  );
}
