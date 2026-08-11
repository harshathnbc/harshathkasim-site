"use client";

import { useRef, useState } from "react";
import { createDocx } from "@/lib/docx";

type Labels = {
  choose: string;
  warning: string;
  convert: string;
  working: string;
  page: string;
  result: string;
  words: string;
  noText: string;
  download: string;
  downloadTxt: string;
  reset: string;
  preview: string;
  error: string;
  encrypted: string;
};

type Output = {
  docxUrl: string;
  txtUrl: string;
  name: string;
  words: number;
  preview: string;
};

type TextItemLike = { str: string; transform: number[] };

/**
 * Groups positioned text runs back into readable paragraphs.
 * Runs sharing a baseline become one line; a larger than usual vertical
 * gap starts a new paragraph.
 */
function itemsToParagraphs(items: TextItemLike[]): string[] {
  const runs = items.filter((i) => i.str && i.str.trim() !== "");
  if (!runs.length) return [];

  type Line = { y: number; parts: { x: number; str: string }[] };
  const lines: Line[] = [];
  for (const item of runs) {
    const x = item.transform[4];
    const y = item.transform[5];
    const line = lines.find((l) => Math.abs(l.y - y) < 3);
    if (line) line.parts.push({ x, str: item.str });
    else lines.push({ y, parts: [{ x, str: item.str }] });
  }

  lines.sort((a, b) => b.y - a.y); // PDF origin is bottom-left
  const texts = lines.map((l) =>
    l.parts
      .sort((a, b) => a.x - b.x)
      .map((p) => p.str)
      .join("")
      .replace(/\s+/g, " ")
      .trim()
  );

  // Median line spacing tells us what counts as a paragraph break.
  const gaps = lines.slice(1).map((l, i) => lines[i].y - l.y).filter((g) => g > 0);
  const median = gaps.length ? gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : 0;
  const breakAt = median * 1.35;

  const paragraphs: string[] = [];
  let current = "";
  for (let i = 0; i < texts.length; i++) {
    if (!texts[i]) continue;
    const gap = i > 0 ? lines[i - 1].y - lines[i].y : 0;
    if (current && breakAt > 0 && gap > breakAt) {
      paragraphs.push(current);
      current = texts[i];
    } else {
      current = current ? `${current} ${texts[i]}` : texts[i];
    }
  }
  if (current) paragraphs.push(current);
  return paragraphs;
}

export default function PdfToWord({ labels }: { labels: Labels }) {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<Output | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function clearOutput() {
    setOutput((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.docxUrl);
        URL.revokeObjectURL(prev.txtUrl);
      }
      return null;
    });
  }

  function reset() {
    clearOutput();
    setFile(null);
    setError(null);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function pick(f: File) {
    if (f.type !== "application/pdf") {
      setError(labels.error);
      return;
    }
    clearOutput();
    setError(null);
    setFile(f);
  }

  async function convert() {
    if (!file) return;
    setBusy(true);
    setError(null);
    clearOutput();
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const doc = await pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
      }).promise;
      const total = doc.numPages;
      setProgress({ done: 0, total });

      const pages: string[][] = [];
      for (let i = 1; i <= total; i++) {
        const p = await doc.getPage(i);
        const content = await p.getTextContent();
        pages.push(itemsToParagraphs(content.items as TextItemLike[]));
        setProgress({ done: i, total });
      }

      const plain = pages.map((p) => p.join("\n\n")).join("\n\n");
      const words = plain.trim() ? plain.trim().split(/\s+/).length : 0;
      if (words === 0) {
        setError(labels.noText);
        return;
      }

      const base = file.name.replace(/\.pdf$/i, "");
      const docx = createDocx(pages);
      const txt = new Blob([plain], { type: "text/plain;charset=utf-8" });

      setOutput({
        docxUrl: URL.createObjectURL(docx),
        txtUrl: URL.createObjectURL(txt),
        name: base,
        words,
        preview: plain.slice(0, 600),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(/password|encrypt/i.test(msg) ? labels.encrypted : labels.error);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-accent">{labels.warning}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) pick(f);
        }}
        className={`rounded-xl border border-dashed p-10 text-center transition-colors ${
          dragging ? "border-accent bg-accent/5" : "border-line/60"
        }`}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-glass px-5 py-2.5 text-sm text-text"
        >
          {labels.choose}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])}
        />
        {file && (
          <p className="mt-4 text-sm text-text-soft break-all">{file.name}</p>
        )}
      </div>

      {file && (
        <button
          type="button"
          onClick={convert}
          disabled={busy}
          className="btn-glass px-5 py-2.5 text-sm text-text disabled:opacity-40"
        >
          {busy
            ? progress
              ? `${labels.working} ${labels.page} ${progress.done}/${progress.total}`
              : labels.working
            : labels.convert}
        </button>
      )}

      {error && <p className="text-sm text-accent">{error}</p>}

      {output && (
        <div className="glass-card p-5 space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {labels.result} — {output.words} {labels.words}
          </p>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2">
              {labels.preview}
            </p>
            <pre className="max-h-48 overflow-auto rounded-lg border border-line/40 bg-surface/40 p-3 text-xs text-text-soft whitespace-pre-wrap">
              {output.preview}
            </pre>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={output.docxUrl}
              download={`${output.name}.docx`}
              className="btn-glass px-5 py-2.5 text-sm text-text"
            >
              {labels.download}
            </a>
            <a
              href={output.txtUrl}
              download={`${output.name}.txt`}
              className="btn-glass px-4 py-2 text-sm text-text-soft"
            >
              {labels.downloadTxt}
            </a>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted hover:text-text transition-colors"
            >
              {labels.reset}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
