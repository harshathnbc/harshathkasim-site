"use client";

import { useRef, useState } from "react";

type Labels = {
  merge: string;
  split: string;
  chooseMerge: string;
  chooseSplit: string;
  selected: string;
  pages: string;
  rangeLabel: string;
  rangeHint: string;
  run: string;
  working: string;
  download: string;
  reset: string;
  error: string;
  encrypted: string;
  needTwo: string;
  badRange: string;
};

type Output = { url: string; name: string; size: number } | null;

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/** Parses "1-3, 5, 8-10" into zero-based page indices. */
function parseRange(spec: string, pageCount: number): number[] | null {
  const out = new Set<number>();
  for (const chunk of spec.split(",")) {
    const part = chunk.trim();
    if (!part) continue;
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (a < 1 || b < a || b > pageCount) return null;
      for (let i = a; i <= b; i++) out.add(i - 1);
    } else if (/^\d+$/.test(part)) {
      const n = Number(part);
      if (n < 1 || n > pageCount) return null;
      out.add(n - 1);
    } else {
      return null;
    }
  }
  return out.size ? [...out].sort((x, y) => x - y) : null;
}

export default function PdfTools({ labels }: { labels: Labels }) {
  const [mode, setMode] = useState<"merge" | "split">("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [range, setRange] = useState("1-1");
  const [output, setOutput] = useState<Output>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function clearOutput() {
    setOutput((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
  }

  function reset() {
    clearOutput();
    setFiles([]);
    setPageCount(null);
    setError(null);
    setRange("1-1");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFiles(list: FileList) {
    const picked = [...list].filter((f) => f.type === "application/pdf");
    if (!picked.length) {
      setError(labels.error);
      return;
    }
    clearOutput();
    setError(null);
    setFiles(picked);

    if (mode === "split") {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const doc = await PDFDocument.load(await picked[0].arrayBuffer(), {
          ignoreEncryption: true,
        });
        const n = doc.getPageCount();
        setPageCount(n);
        setRange(`1-${n}`);
      } catch {
        setError(labels.encrypted);
        setPageCount(null);
      }
    }
  }

  async function run() {
    setBusy(true);
    setError(null);
    clearOutput();
    try {
      const { PDFDocument } = await import("pdf-lib");

      if (mode === "merge") {
        if (files.length < 2) {
          setError(labels.needTwo);
          return;
        }
        const merged = await PDFDocument.create();
        for (const f of files) {
          const doc = await PDFDocument.load(await f.arrayBuffer(), {
            ignoreEncryption: true,
          });
          const copied = await merged.copyPages(doc, doc.getPageIndices());
          copied.forEach((p) => merged.addPage(p));
        }
        const bytes = await merged.save();
        const blob = new Blob([bytes as unknown as BlobPart], {
          type: "application/pdf",
        });
        setOutput({
          url: URL.createObjectURL(blob),
          name: "merged.pdf",
          size: blob.size,
        });
      } else {
        if (!files.length || !pageCount) return;
        const indices = parseRange(range, pageCount);
        if (!indices) {
          setError(labels.badRange);
          return;
        }
        const src = await PDFDocument.load(await files[0].arrayBuffer(), {
          ignoreEncryption: true,
        });
        const out = await PDFDocument.create();
        const copied = await out.copyPages(src, indices);
        copied.forEach((p) => out.addPage(p));
        const bytes = await out.save();
        const blob = new Blob([bytes as unknown as BlobPart], {
          type: "application/pdf",
        });
        const base = files[0].name.replace(/\.pdf$/i, "");
        setOutput({
          url: URL.createObjectURL(blob),
          name: `${base}-pages.pdf`,
          size: blob.size,
        });
      }
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["merge", labels.merge],
            ["split", labels.split],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setMode(key);
              reset();
            }}
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

      <div className="rounded-xl border border-dashed border-line/60 p-10 text-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-glass px-5 py-2.5 text-sm text-text"
        >
          {mode === "merge" ? labels.chooseMerge : labels.chooseSplit}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple={mode === "merge"}
          className="sr-only"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {files.length > 0 && (
          <div className="mt-4 text-sm text-text-soft">
            <p>
              {labels.selected}: {files.length}
            </p>
            <ul className="mt-1 text-xs text-muted space-y-0.5">
              {files.map((f) => (
                <li key={f.name} className="break-all">
                  {f.name}
                </li>
              ))}
            </ul>
            {pageCount !== null && (
              <p className="mt-2 text-xs text-muted">
                {pageCount} {labels.pages}
              </p>
            )}
          </div>
        )}
      </div>

      {mode === "split" && pageCount !== null && (
        <label className="block glass-card p-5">
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            {labels.rangeLabel}
          </span>
          <input
            type="text"
            value={range}
            dir="ltr"
            onChange={(e) => setRange(e.target.value)}
            className="w-full mt-2 rounded-lg border border-line/60 bg-surface/60 px-3 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
          />
          <span className="mt-2 block text-xs text-muted">{labels.rangeHint}</span>
        </label>
      )}

      {files.length > 0 && (
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className="btn-glass px-5 py-2.5 text-sm text-text disabled:opacity-40"
        >
          {busy ? labels.working : labels.run}
        </button>
      )}

      {error && <p className="text-sm text-accent">{error}</p>}

      {output && (
        <div className="glass-card p-5 flex flex-wrap items-center gap-4">
          <div className="flex-1 text-sm">
            <p className="text-text break-all">{output.name}</p>
            <p className="text-muted">{formatBytes(output.size)}</p>
          </div>
          <a
            href={output.url}
            download={output.name}
            className="btn-glass px-5 py-2.5 text-sm text-text"
          >
            {labels.download}
          </a>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted hover:text-text transition-colors"
          >
            {labels.reset}
          </button>
        </div>
      )}
    </div>
  );
}
