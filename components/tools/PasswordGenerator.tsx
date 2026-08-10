"use client";

import { useCallback, useEffect, useState } from "react";

type Labels = {
  length: string;
  upper: string;
  lower: string;
  numbers: string;
  symbols: string;
  regenerate: string;
  copy: string;
  copied: string;
  strength: string;
  weak: string;
  fair: string;
  strong: string;
  excellent: string;
  noneSelected: string;
};

const SETS = {
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lower: "abcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%^&*-_=+?",
};

/** Uniform random index using rejection sampling — avoids modulo bias. */
function randomIndex(max: number) {
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let n = 0;
  do {
    crypto.getRandomValues(buf);
    n = buf[0];
  } while (n >= limit);
  return n % max;
}

export default function PasswordGenerator({ labels }: { labels: Labels }) {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const pool = (Object.keys(SETS) as (keyof typeof SETS)[])
      .filter((k) => opts[k])
      .map((k) => SETS[k])
      .join("");
    if (!pool) {
      setPassword("");
      return;
    }
    let out = "";
    for (let i = 0; i < length; i++) out += pool[randomIndex(pool.length)];
    setPassword(out);
  }, [length, opts]);

  useEffect(() => {
    generate();
  }, [generate]);

  async function copy() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = password;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  // Rough entropy in bits: length × log2(pool size).
  const poolSize = (Object.keys(SETS) as (keyof typeof SETS)[])
    .filter((k) => opts[k])
    .reduce((n, k) => n + SETS[k].length, 0);
  const bits = poolSize ? Math.round(length * Math.log2(poolSize)) : 0;
  const level =
    bits >= 128 ? "excellent" : bits >= 90 ? "strong" : bits >= 60 ? "fair" : "weak";
  const levelLabel = labels[level as keyof Labels];
  const levelColor =
    level === "weak"
      ? "text-muted"
      : level === "fair"
        ? "text-text-soft"
        : "text-accent";

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <p
          dir="ltr"
          className="font-mono text-lg break-all text-text min-h-[2rem] select-all"
        >
          {password || labels.noneSelected}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={generate} className="btn-glass px-4 py-2 text-sm text-text">
            {labels.regenerate}
          </button>
          <button
            type="button"
            onClick={copy}
            disabled={!password}
            className="btn-glass px-4 py-2 text-sm text-text disabled:opacity-40"
            aria-live="polite"
          >
            {copied ? `✓ ${labels.copied}` : labels.copy}
          </button>
          <span className={`self-center text-xs ${levelColor}`}>
            {labels.strength}: {levelLabel} ({bits} bits)
          </span>
        </div>
      </div>

      <div className="glass-card p-5 space-y-5">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            {labels.length}: {length}
          </span>
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full mt-2 accent-[var(--color-accent)]"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["upper", labels.upper],
              ["lower", labels.lower],
              ["numbers", labels.numbers],
              ["symbols", labels.symbols],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-text-soft">
              <input
                type="checkbox"
                checked={opts[key]}
                onChange={(e) => setOpts({ ...opts, [key]: e.target.checked })}
                className="accent-[var(--color-accent)] w-4 h-4"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
