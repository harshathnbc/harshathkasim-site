"use client";

import { useEffect, useMemo, useState } from "react";

type Labels = {
  gregorianToHijri: string;
  hijriToGregorian: string;
  gregorianDate: string;
  hijriDate: string;
  day: string;
  month: string;
  year: string;
  result: string;
  today: string;
  invalid: string;
};

const DAY = 86_400_000;

/** Umm al-Qura is the civil calendar used in Saudi Arabia. */
const HIJRI_CAL = "islamic-umalqura";

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhirah",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

type Ymd = { year: number; month: number; day: number };

function toHijri(date: Date): Ymd | null {
  try {
    const parts = new Intl.DateTimeFormat(`en-u-ca-${HIJRI_CAL}-nu-latn`, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).formatToParts(date);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    const year = get("year");
    const month = get("month");
    const day = get("day");
    if (!year || !month || !day) return null;
    return { year, month, day };
  } catch {
    return null;
  }
}

/**
 * Inverts toHijri by estimating the Gregorian date arithmetically, then
 * scanning nearby days for an exact match. The Umm al-Qura month lengths
 * are tabular, so a short scan is enough.
 */
function toGregorian(h: Ymd): Date | null {
  const approx =
    Date.UTC(622, 6, 16) +
    Math.round(((h.year - 1) * 354.367 + (h.month - 1) * 29.53 + (h.day - 1)) * DAY);

  for (let offset = 0; offset <= 60; offset++) {
    for (const sign of offset === 0 ? [1] : [1, -1]) {
      const candidate = new Date(approx + sign * offset * DAY);
      const back = toHijri(candidate);
      if (
        back &&
        back.year === h.year &&
        back.month === h.month &&
        back.day === h.day
      ) {
        return candidate;
      }
    }
  }
  return null;
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Day/month/year, the form used on most documents. */
function numeric(day: number, month: number, year: number) {
  return `${pad(day)}/${pad(month)}/${year}`;
}

export default function HijriConverter({
  labels,
  locale,
}: {
  labels: Labels;
  locale: string;
}) {
  const [mode, setMode] = useState<"g2h" | "h2g">("g2h");
  const [gregorian, setGregorian] = useState("");
  const [h, setH] = useState({ day: "1", month: "1", year: "1447" });

  // Default to today, set after mount so server and client markup agree.
  useEffect(() => {
    const now = new Date();
    setGregorian(iso(now));
    const th = toHijri(now);
    if (th) setH({ day: String(th.day), month: String(th.month), year: String(th.year) });
  }, []);

  const gregorianResult = useMemo(() => {
    if (mode !== "g2h" || !gregorian) return null;
    const d = new Date(`${gregorian}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return null;
    const hij = toHijri(d);
    if (!hij) return null;
    return {
      text: `${hij.day} ${HIJRI_MONTHS[hij.month - 1]} ${hij.year} AH`,
      numeric: numeric(hij.day, hij.month, hij.year),
      localized: new Intl.DateTimeFormat(`${locale}-u-ca-${HIJRI_CAL}`, {
        dateStyle: "full",
        timeZone: "UTC",
      }).format(d),
    };
  }, [mode, gregorian, locale]);

  const hijriResult = useMemo(() => {
    if (mode !== "h2g") return null;
    const parsed = {
      year: Number(h.year),
      month: Number(h.month),
      day: Number(h.day),
    };
    if (
      !parsed.year ||
      parsed.month < 1 ||
      parsed.month > 12 ||
      parsed.day < 1 ||
      parsed.day > 30
    ) {
      return null;
    }
    const d = toGregorian(parsed);
    if (!d) return null;
    return {
      text: iso(d),
      numeric: numeric(d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()),
      localized: new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeZone: "UTC",
      }).format(d),
    };
  }, [mode, h, locale]);

  const result = mode === "g2h" ? gregorianResult : hijriResult;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["g2h", labels.gregorianToHijri],
            ["h2g", labels.hijriToGregorian],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
              mode === key
                ? "border-accent/70 text-text bg-accent/10"
                : "border-line/60 text-muted hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="glass-card p-5">
        {mode === "g2h" ? (
          <label className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              {labels.gregorianDate}
            </span>
            <input
              type="date"
              value={gregorian}
              onChange={(e) => setGregorian(e.target.value)}
              className="w-full mt-2 rounded-lg border border-line/60 bg-surface/60 px-3 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
            />
          </label>
        ) : (
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              {labels.hijriDate}
            </span>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <label className="block">
                <span className="text-xs text-muted">{labels.day}</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={h.day}
                  onChange={(e) => setH({ ...h, day: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-line/60 bg-surface/60 px-3 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted">{labels.month}</span>
                <select
                  value={h.month}
                  onChange={(e) => setH({ ...h, month: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-line/60 bg-surface/60 px-2 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
                >
                  {HIJRI_MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {i + 1}. {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted">{labels.year}</span>
                <input
                  type="number"
                  min={1}
                  max={1600}
                  value={h.year}
                  onChange={(e) => setH({ ...h, year: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-line/60 bg-surface/60 px-3 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-3">
          {labels.result}
        </p>
        {result ? (
          <>
            <p className="font-serif text-3xl text-text" dir="ltr">
              {result.text}
            </p>
            <p className="mt-2 font-mono text-xl text-accent" dir="ltr">
              {result.numeric}
            </p>
            <p className="mt-2 text-sm text-text-soft">{result.localized}</p>
          </>
        ) : (
          <p className="text-sm text-muted">{labels.invalid}</p>
        )}
      </div>
    </div>
  );
}
