const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE ?? "America/Lima";

export interface MonthBucket {
  month: string; // 'YYYY-MM'
  label: string; // 'May', 'Jun', etc.
  year: number;
  monthNum: number; // 1 - 12
  startUTC: Date;
  endUTC: Date;
}

/**
 * Extracts zoned date parts in the target timezone.
 */
function getZonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/**
 * Returns a UTC Date corresponding to the exact 00:00:00 of the 1st day of the given month in timeZone.
 */
export function getZonedMonthStartUTC(
  year: number,
  month: number,
  timeZone: string = BUSINESS_TIMEZONE,
): Date {
  // Use noon on 1st of month as reference to avoid any midnight boundary shifts
  const approx = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
  const p = getZonedParts(approx, timeZone);
  const offsetMs =
    approx.getTime() - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const targetUtcMs = Date.UTC(year, month - 1, 1, 0, 0, 0) + offsetMs;
  return new Date(targetUtcMs);
}

/**
 * Computes consecutive month buckets ending with the current month in timeZone.
 */
export function getMonthBuckets(
  count: number,
  now: Date = new Date(),
  timeZone: string = BUSINESS_TIMEZONE,
): MonthBucket[] {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);

  const currentYear = Number(parts.find((p) => p.type === "year")?.value);
  const currentMonth = Number(parts.find((p) => p.type === "month")?.value); // 1-12

  const buckets: MonthBucket[] = [];

  for (let i = count - 1; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }

    const monthStr = String(m).padStart(2, "0");
    const monthKey = `${y}-${monthStr}`;

    const sampleDate = new Date(Date.UTC(y, m - 1, 15, 12, 0, 0));
    const label = new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "short",
    }).format(sampleDate);

    const startUTC = getZonedMonthStartUTC(y, m, timeZone);

    let nextM = m + 1;
    let nextY = y;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    const endUTC = getZonedMonthStartUTC(nextY, nextM, timeZone);

    buckets.push({
      month: monthKey,
      label,
      year: y,
      monthNum: m,
      startUTC,
      endUTC,
    });
  }

  return buckets;
}

/**
 * Formats a Date into a 'YYYY-MM' string in the business timezone.
 */
export function formatMonthKey(date: Date, timeZone: string = BUSINESS_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  return `${year}-${month}`;
}

/**
 * Calculates percentage variation between current and previous values: ((current - previous) / previous) * 100
 * Returns null if previous is 0 and current is 0, or calculates cleanly.
 */
export function calculatePercentageChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null; // Cannot compute division by zero with non-zero current
  }
  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 10) / 10;
}
