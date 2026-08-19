import Link from "next/link";
import { ArrowRight, CalendarPlus, Check, UserPlus, Users } from "lucide-react";
import { Card } from "@/components/ui";
import type { Dict } from "@/lib/i18n";

/**
 * What a brand new practice sees instead of four zeros.
 *
 * The first minute decides whether someone comes back, so an empty practice
 * gets three concrete steps with the next one highlighted, rather than an
 * empty dashboard that gives no clue what to do.
 */
export function GettingStarted({
  t,
  base,
  hasPatients,
  hasAppointments,
  hasTeam,
}: {
  t: Dict;
  base: string;
  hasPatients: boolean;
  hasAppointments: boolean;
  hasTeam: boolean;
}) {
  const steps = [
    {
      done: hasPatients,
      icon: UserPlus,
      title: t.dash_step_patient,
      hint: t.dash_step_patient_hint,
      href: `${base}/patients/new`,
    },
    {
      done: hasAppointments,
      icon: CalendarPlus,
      title: t.dash_step_appt,
      hint: t.dash_step_appt_hint,
      href: `${base}/appointments`,
    },
    {
      done: hasTeam,
      icon: Users,
      title: t.dash_step_team,
      hint: t.dash_step_team_hint,
      href: `${base}/team`,
    },
  ];
  const nextIndex = steps.findIndex((s) => !s.done);

  return (
    <Card className="mb-5 overflow-hidden">
      <div className="border-b border-black/[.06] bg-brand-50/60 px-6 py-5">
        <h2 className="text-lg font-semibold">{t.dash_start_title}</h2>
        <p className="mt-1 text-[15px] text-ink/65">{t.dash_start_body}</p>
      </div>
      <ol className="divide-y divide-black/[.06]">
        {steps.map((s, i) => {
          const isNext = i === nextIndex;
          return (
            <li key={s.title}>
              <Link
                href={s.href}
                className={`flex min-h-[76px] items-center gap-4 px-6 py-4 transition hover:bg-mist/70 ${
                  isNext ? "bg-white" : ""
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    s.done
                      ? "bg-brand-600 text-white"
                      : isNext
                        ? "bg-brand-100 text-brand-700"
                        : "bg-black/[.04] text-muted"
                  }`}
                >
                  {s.done ? <Check size={20} /> : <s.icon size={20} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-[15px] font-semibold ${
                      s.done ? "text-muted line-through" : ""
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="block text-sm text-muted">
                    {s.done ? t.dash_step_done : s.hint}
                  </span>
                </span>
                {!s.done && (
                  <ArrowRight
                    size={18}
                    className={isNext ? "shrink-0 text-brand-600" : "shrink-0 text-muted"}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
