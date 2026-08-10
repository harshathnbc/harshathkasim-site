"use client";

import { useRef, useState } from "react";

type Labels = {
  choose: string;
  warning: string;
  dpi: string;
  quality: string;
  grayscale: string;
  compress: string;
  working: string;
  page: string;
  original: string;
  compressed: string;
  saved: string;
  larger: string;
  download: string;
  reset: string;
  error: string;
  encrypted: string;
};

type Output = { url: string; name: string; size: number };

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function PdfCompressor({ labels }: { labels: Labels }) {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState(110);
  const [quality, setQuality] = useState(70);
  const [grayscale, setGrayscale] = useState(false);
  const [output, setOutput] = useState<Output | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function clearOutput() {
    setOutput((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
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

  async function compress() {
    if (!file) return;
    setBusy(true);
    setError(null);
    clearOutput();
    try {
      const pdfjs = await import("pdfjs-dist");
      // Worker is bundled and served from our own origin, so the strict CSP
      // (worker-src 'self') is satisfied.
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const { PDFDocument } = await import("pdf-lib");

      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = await pdfjs.getDocument({ data: bytes }).promise;
      const out = await PDFDocument.create();
      const total = src.numPages;
      setProgress({ done: 0, total });

      for (let i = 1; i <= total; i++) {
        const page = await src.getPage(i);
        // PDF user units are 72 per inch, so scale = target DPI / 72.
        const viewport = page.getViewport({ scale: dpi / 72 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) throw new Error("no canvas context");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvas, canvasContext: ctx, viewport }).promise;

        if (grayscale) {
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = img.data;
          for (let p = 0; p < d.length; p += 4) {
            const v = (d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114) | 0;
            d[p] = d[p + 1] = d[p + 2] = v;
          }
          ctx.putImageData(img, 0, 0);
        }

        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/jpeg", quality / 100)
        );
        if (!blob) throw new Error("encode failed");

        const jpg = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
        // Keep the original page size so print/paper dimensions are unchanged.
        const base = page.getViewport({ scale: 1 });
        const newPage = out.addPage([base.width, base.height]);
        newPage.drawImage(jpg, { x: 0, y: 0, width: base.width, height: base.height });

        canvas.width = 0;
        canvas.height = 0;
        setProgress({ done: i, total });
      }

      const saved = await out.save();
      const blob = new Blob([saved as unknown as BlobPart], {
        type: "application/pdf",
      });
      setOutput({
        url: URL.createObjectURL(blob),
        name: file.name.replace(/\.pdf$/i, "") + "-compressed.pdf",
        size: blob.size,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(/password|encrypt/i.test(msg) ? labels.encrypted : labels.error);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  const delta =
    file && output ? Math.round((1 - output.size / file.size) * 100) : 0;

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
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pick(f);
          }}
        />
        {file && (
          <p className="mt-4 text-sm text-text-soft break-all">
            {file.name} — {formatBytes(file.size)}
          </p>
        )}
      </div>

      {file && (
        <>
          <div className="glass-card p-5 grid sm:grid-cols-3 gap-5">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {labels.dpi}: {dpi}
              </span>
              <input
                type="range"
                min={72}
                max={200}
                step={2}
                value={dpi}
                onChange={(e) => setDpi(Number(e.target.value))}
                className="w-full mt-2 accent-[var(--color-accent)]"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {labels.quality}: {quality}
              </span>
              <input
                type="range"
                min={30}
                max={95}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full mt-2 accent-[var(--color-accent)]"
              />
            </label>
            <label className="flex items-end gap-2 text-sm text-text-soft pb-1">
              <input
                type="checkbox"
                checked={grayscale}
                onChange={(e) => setGrayscale(e.target.checked)}
                className="accent-[var(--color-accent)] w-4 h-4"
              />
              {labels.grayscale}
            </label>
          </div>

          <button
            type="button"
            onClick={compress}
            disabled={busy}
            className="btn-glass px-5 py-2.5 text-sm text-text disabled:opacity-40"
          >
            {busy
              ? progress
                ? `${labels.working} ${labels.page} ${progress.done}/${progress.total}`
                : labels.working
              : labels.compress}
          </button>
        </>
      )}

      {error && <p className="text-sm text-accent">{error}</p>}

      {output && file && (
        <div className="glass-card p-5 flex flex-wrap items-center gap-5">
          <div className="flex-1 text-sm space-y-1 min-w-[12rem]">
            <p className="text-muted">
              {labels.original}:{" "}
              <span className="text-text-soft">{formatBytes(file.size)}</span>
            </p>
            <p className="text-muted">
              {labels.compressed}:{" "}
              <span className="text-text">{formatBytes(output.size)}</span>
            </p>
            <p className={delta > 0 ? "text-accent" : "text-muted"}>
              {delta > 0 ? `${labels.saved} ${delta}%` : labels.larger}
            </p>
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
