// Czech number formatting. Intl uses a non-breaking space as the thousands
// separator and a decimal comma, e.g. "1 000 Kč" or "23,7 kg".

const NBSP = " ";

const integer = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
const money = new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const oneDecimal = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 1 });

export function formatPrice(amount: number): string {
  const formatted = Number.isInteger(amount)
    ? integer.format(amount)
    : new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return `${formatted}${NBSP}Kč`;
}

export function formatNumber(value: number): string {
  return money.format(value);
}

export function formatWeight(kg: number): string {
  return `${oneDecimal.format(kg)}${NBSP}kg`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" }).format(
    typeof date === "string" ? new Date(date) : date,
  );
}

/** "1 pracovní den", "3 pracovní dny", "10 pracovních dnů" */
export function formatWorkingDays(days: number): string {
  const word = days === 1 ? "pracovní den" : days >= 2 && days <= 4 ? "pracovní dny" : "pracovních dnů";
  return `${days}${NBSP}${word}`;
}

/** "1 kus", "3 kusy", "5 kusů" */
export function formatPieces(count: number): string {
  const word = count === 1 ? "kus" : count >= 2 && count <= 4 ? "kusy" : "kusů";
  return `${count}${NBSP}${word}`;
}
