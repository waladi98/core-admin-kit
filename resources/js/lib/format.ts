/**
 * Display formatting for the frontend. Follows the user's language (`intlLocale()`)
 * and the display timezone shared by the server (`APP_DISPLAY_TIMEZONE`, default Asia/Jakarta).
 * Mirrors app/Support/Format.php so server and browser show the same values.
 *
 * Empty values (null/undefined/'') render as an em dash.
 */
import { currentTimezone, intlLocale } from '@/lib/i18n';

/** Non-breaking space, so "Rp 3,5 M" never wraps. */
const NBSP = String.fromCharCode(160);
const EMPTY = '—';

type Numeric = number | null | undefined;
type DateValue = Date | string | number | null | undefined;

function toDate(value: DateValue): Date | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    // A plain "YYYY-MM-DD" is a calendar date, not a moment: keep it on that day in every timezone.
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);

        return new Date(Date.UTC(year, month - 1, day, 12));
    }

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function isCalendarDate(value: DateValue): boolean {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** "Rp 1.250.000" (id) / "IDR 1,250,000" (en). Whole units, no decimals. */
export function formatCurrency(value: Numeric, currency = 'IDR'): string {
    if (value === null || value === undefined) {
        return EMPTY;
    }

    return new Intl.NumberFormat(intlLocale(), { style: 'currency', currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(value);
}

/** Short rupiah for cards and charts: "Rp 3,5 M" (id) / "IDR 3.5B" (en). Below one thousand it equals formatCurrency(). */
export function formatCurrencyCompact(value: Numeric, currency = 'IDR'): string {
    if (value === null || value === undefined) {
        return EMPTY;
    }

    const isIndonesian = intlLocale().startsWith('id');
    const units: [number, string][] = isIndonesian
        ? [
              [1e12, ' T'],
              [1e9, ' M'],
              [1e6, ' jt'],
              [1e3, ' rb'],
          ]
        : [
              [1e12, 'T'],
              [1e9, 'B'],
              [1e6, 'M'],
              [1e3, 'K'],
          ];
    const unit = units.find(([size]) => Math.abs(value) >= size);

    if (!unit) {
        return formatCurrency(value, currency);
    }

    const symbol = isIndonesian && currency === 'IDR' ? 'Rp' : currency;

    return [symbol, formatNumber(value / unit[0], 1) + unit[1]].join(NBSP).replace(' ', NBSP);
}

/** "1.250.000" (id) / "1,250,000" (en). */
export function formatNumber(value: Numeric, maximumFractionDigits = 2): string {
    return value === null || value === undefined ? EMPTY : new Intl.NumberFormat(intlLocale(), { maximumFractionDigits }).format(value);
}

/** Short large numbers: "1,2 jt" (id) / "1.2M" (en). */
export function formatCompact(value: Numeric): string {
    return value === null || value === undefined
        ? EMPTY
        : new Intl.NumberFormat(intlLocale(), { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/** Percent where 7.5 means 7.5%: "7,5%" (id) / "7.5%" (en). */
export function formatPercent(value: Numeric, maximumFractionDigits = 1): string {
    return value === null || value === undefined
        ? EMPTY
        : new Intl.NumberFormat(intlLocale(), { style: 'percent', maximumFractionDigits }).format(value / 100);
}

/**
 * Date in the display timezone.
 * - `medium` (default): "17 Okt 2026" / "Oct 17, 2026"
 * - `long`: "17 Oktober 2026" / "October 17, 2026"
 * - `full`: "Sabtu, 17 Oktober 2026" / "Saturday, October 17, 2026"
 */
export function formatDate(value: DateValue, style: 'medium' | 'long' | 'full' = 'medium'): string {
    const date = toDate(value);

    if (!date) {
        return EMPTY;
    }

    return new Intl.DateTimeFormat(intlLocale(), {
        dateStyle: style,
        // Calendar dates are fixed days; real moments are shown in the display timezone.
        timeZone: isCalendarDate(value) ? 'UTC' : currentTimezone(),
    }).format(date);
}

/** "17 Okt 2026, 14.30" / "Oct 17, 2026, 2:30 PM" in the display timezone. */
export function formatDateTime(value: DateValue): string {
    const date = toDate(value);

    return date
        ? new Intl.DateTimeFormat(intlLocale(), { dateStyle: 'medium', timeStyle: 'short', timeZone: currentTimezone() }).format(date)
        : EMPTY;
}

/** "3 jam yang lalu" / "3 hours ago"; "kemarin" / "yesterday". */
export function formatRelative(value: DateValue, now: Date = new Date()): string {
    const date = toDate(value);

    if (!date) {
        return EMPTY;
    }

    const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['year', 31_536_000],
        ['month', 2_592_000],
        ['week', 604_800],
        ['day', 86_400],
        ['hour', 3_600],
        ['minute', 60],
    ];
    const formatter = new Intl.RelativeTimeFormat(intlLocale(), { numeric: 'auto' });

    for (const [unit, unitSeconds] of units) {
        if (Math.abs(seconds) >= unitSeconds) {
            return formatter.format(Math.round(seconds / unitSeconds), unit);
        }
    }

    return formatter.format(0, 'second');
}
