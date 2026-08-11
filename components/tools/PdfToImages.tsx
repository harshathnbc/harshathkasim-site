"use client";

import { useRef, useState } from "react";
import { createZip } from "@/lib/zip";

type Labels = {
  choose: string;
  dpi: string;
  format: string;
  quality: string;
  convert: string;
  working: string;
  page: string;
  pages: string;
  result: string;
  download: string;
  downloadZip: string;
  reset: string;
  error: string;
  encrypted: string;
};

type Output = { url: string; name: string; size: number; count: number };

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function PdfToImages({ labels }: { labels: Labels }) {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState(150);
  const [format, setFormat] = useState<"image/png" | "image/jpeg">("image/png");
  const [quality, setQuality] = useState(90);
  const [output, setOutput] = useState<Output | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
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
    setPreviews((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return [];
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

      const ext = format === "image/png" ? "png" : "jpg";
      const base = file.name.replace(/\.pdf$/i, "");
      const entries: { name: string; data: Uint8Array }[] = [];
      const previewUrls: string[] = [];

      for (let i = 1; i <= total; i++) {
        const p = await doc.getPage(i);
        const viewport = p.getViewport({ scale: dpi / 72 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const ctx = canvas.getContext("2d", { alpha: format === "image/png" });
        if (!ctx) throw new Error("no context");
        if (format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        await p.render({ canvas, canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, format, quality / 100)
        );
        if (!blob) throw new Error("encode failed");

        entries.push({
          name: `${base}-${String(i).padStart(3, "0")}.${ext}`,
          data: new Uint8Array(await blob.arrayBuffer()),
        });
        // Keep a handful of thumbnails so the result is visible.
        if (previewUrls.length < 4) previewUrls.push(URL.createObjectURL(blob));

        canvas.width = 0;
        canvas.height = 0;
        setProgress({ done: i, total });
      }

      setPreviews(previewUrls);

      if (entries.length === 1) {
        const blob = new Blob([entries[0].data as unknown as BlobPart], {
          type: format,
        });
        setOutput({
          url: URL.createObjectURL(blob),
          name: entries[0].name,
          size: blob.size,
          count: 1,
        });
      } else {
        const zip = createZip(entries);
        setOutput({
          url: URL.createObjectURL(zip),
          name: `${base}-images.zip`,
          size: zip.size,
          count: entries.length,
        });
      }
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
                max={300}
                step={6}
                value={dpi}
                onChange={(e) => setDpi(Number(e.target.value))}
                className="w-full mt-2 accent-[var(--color-accent)]"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {labels.format}
              </span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as typeof format)}
                className="w-full mt-2 rounded-lg border border-line/60 bg-surface/60 px-3 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
              </select>
            </label>
            <label className={`block ${format === "image/png" ? "opacity-40" : ""}`}>
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {labels.quality}: {format === "image/png" ? "—" : quality}
              </span>
              <input
                type="range"
                min={40}
                max={100}
                value={quality}
                disabled={format === "image/png"}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full mt-2 accent-[var(--color-accent)]"
              />
            </label>
          </div>

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
        </>
      )}

      {error && <p className="text-sm text-accent">{error}</p>}

      {output && (
        <div className="glass-card p-5 space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {labels.result}
          </p>
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {previews.map((src) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-24 w-auto rounded border border-line/50 bg-white"
                />
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <p className="flex-1 text-sm text-text-soft">
              {output.count} {labels.pages} — {formatBytes(output.size)}
            </p>
            <a
              href={output.url}
              download={output.name}
              className="btn-glass px-5 py-2.5 text-sm text-text"
            >
              {output.count > 1 ? labels.downloadZip : labels.download}
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
