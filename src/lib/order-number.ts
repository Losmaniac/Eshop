// Order numbers double as the variable symbol (VS) of the bank transfer, so
// they must be numeric and at most 10 digits. Format: YYMMDD + 4 random
// digits, e.g. 2610041234. Uniqueness is checked against the database.

export function generateOrderNumber(date: Date = new Date(), random: () => number = secureRandom): string {
  const yy = String(date.getFullYear() % 100).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const suffix = String(Math.floor(random() * 10000)).padStart(4, "0");
  return `${yy}${mm}${dd}${suffix}`;
}

export function isValidVariableSymbol(vs: string): boolean {
  return /^\d{1,10}$/.test(vs);
}

/** Unguessable token for the order confirmation URL. */
export function generateToken(bytes = 18): string {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  let binary = "";
  for (const b of data) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function secureRandom(): number {
  const data = new Uint32Array(1);
  crypto.getRandomValues(data);
  return data[0] / 2 ** 32;
}
