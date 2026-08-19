import type { Locale } from "./i18n";
import { CLINIC_TZ } from "./time";

const tag = (l: Locale) => (l === "el" ? "el-GR" : "en-GB");

/**
 * Every date and time is rendered in the clinic's timezone, never the
 * server's. Without this a deployment running in UTC shows a nine o'clock
 * appointment as six o'clock.
 */
export function money(value: number, locale: Locale): string {
  return new Intl.NumberFormat(tag(locale), { style: "currency", currency: "EUR" }).format(value);
}

/** Money without the cents, for glance-sized figures where they add nothing. */
export function moneyRound(value: number, locale: Locale): string {
  return new Intl.NumberFormat(tag(locale), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function date(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    dateStyle: "medium",
    timeZone: CLINIC_TZ,
  }).format(new Date(value));
}

export function longDate(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    dateStyle: "long",
    timeZone: CLINIC_TZ,
  }).format(new Date(value));
}

export function dateTime(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CLINIC_TZ,
  }).format(new Date(value));
}

export function time(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CLINIC_TZ,
  }).format(new Date(value));
}

export function weekday(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: CLINIC_TZ,
  }).format(new Date(value));
}

export function shortDate(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    day: "numeric",
    month: "short",
    timeZone: CLINIC_TZ,
  }).format(new Date(value));
}
