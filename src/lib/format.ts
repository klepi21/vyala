import type { Locale } from "./i18n";

const tag = (l: Locale) => (l === "el" ? "el-GR" : "en-GB");

export function money(value: number, locale: Locale): string {
  return new Intl.NumberFormat(tag(locale), { style: "currency", currency: "EUR" }).format(value);
}

export function date(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), { dateStyle: "medium" }).format(new Date(value));
}

export function longDate(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), { dateStyle: "long" }).format(new Date(value));
}

export function dateTime(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(value));
}

export function time(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), { hour: "2-digit", minute: "2-digit" }).format(
    new Date(value)
  );
}

export function weekday(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    weekday: "long", day: "numeric", month: "long",
  }).format(new Date(value));
}

export function shortDate(value: string | Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), { day: "numeric", month: "short" }).format(
    new Date(value)
  );
}
