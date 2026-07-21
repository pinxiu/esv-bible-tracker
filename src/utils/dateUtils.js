/**
 * Beijing Timezone (UTC+8) Date Utilities
 */
export const BEIJING_TZ = 'Asia/Shanghai';

/**
 * Returns YYYY-MM-DD in Asia/Shanghai (Beijing) timezone
 * e.g. "2026-07-21"
 */
export function getTodayBeijingDate() {
  const options = { timeZone: BEIJING_TZ, year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD
  return formatter.format(new Date());
}

/**
 * Returns M/D in Asia/Shanghai (Beijing) timezone
 * e.g. "7/21"
 */
export function getTodayBeijingMD() {
  const options = { timeZone: BEIJING_TZ, month: 'numeric', day: 'numeric' };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  return formatter.format(new Date());
}

/**
 * Returns Month Day formatted in Beijing Timezone
 * e.g. "July 21"
 */
export function getTodayBeijingMonthDay() {
  const options = { timeZone: BEIJING_TZ, month: 'long', day: 'numeric' };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  return formatter.format(new Date());
}

/**
 * Normalizes any MM/DD or plan item date into YYYY-MM-DD format
 */
export function toISOStringDate(dateStr, year) {
  if (!dateStr) return "";
  if (typeof dateStr === 'object' && dateStr.date) {
    year = dateStr.year;
    dateStr = dateStr.date;
  }

  if (dateStr.includes('-') && dateStr.length === 10) return dateStr;

  const parts = dateStr.split('/');
  if (parts.length < 2) return dateStr;

  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  const mm = m.toString().padStart(2, '0');
  const dd = d.toString().padStart(2, '0');

  // Infer year if not explicitly passed: schedule starts July 2026 and ends July 2027
  const yyyy = year || (m < 7 ? 2027 : 2026);

  return `${yyyy}-${mm}-${dd}`;
}

export function isDatePast(dateStr, year) {
  if (!dateStr) return false;
  const isoDate = toISOStringDate(dateStr, year);
  const today = getTodayBeijingDate();
  return isoDate < today;
}

export function isDateToday(dateStr, year) {
  if (!dateStr) return false;
  const isoDate = toISOStringDate(dateStr, year);
  const today = getTodayBeijingDate();
  return isoDate === today;
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split(/[-/]/);
  if (parts.length < 2) return dateStr;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  if (isNaN(m) || m < 1 || m > 12) return dateStr;
  return `${months[m - 1]} ${d}`;
}
