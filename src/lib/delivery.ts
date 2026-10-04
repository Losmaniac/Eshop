// Delivery estimates. Weekends are skipped; public holidays are not taken
// into account, so the date is shown as approximate ("nejpozději přibližně").

export function addWorkingDays(from: Date, days: number): Date {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return date;
}

/** Expected dispatch date: one working day for the payment, then production. */
export function estimatedDispatch(leadTimeDays: number, from: Date = new Date()): Date {
  return addWorkingDays(from, leadTimeDays + 1);
}

export function formatDayMonth(date: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", { weekday: "short", day: "numeric", month: "numeric" }).format(date);
}
