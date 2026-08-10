"use client";

import { useRef, useState } from "react";

type Labels = {
  drop: string;
  choose: string;
  format: string;
  quality: string;
  original: string;
  converted: string;
  download: string;
  reset: string;
  working: string;
  error: string;
};

type Result = { url: string; size: number; name: string };

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

const FORMATS = [
  { mime: "image/webp", label: "WebP", ext: "webp" },
  { mime: "image/jpeg", label: "JPEG", ext: "jpg" },
  { mime: "image/png", label: "PNG", ext: "png" },
] as const;

export default function ImageConverter({ labels }: { labels: Labels }) {
  const [original, setOriginal] = useState<{ size: number; name: string } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [format, setFormat] = useState<string>("image/webp");
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function convert(file: File, mime: string, q: number) {
    setBusy(true);
    setError(false);
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no context");
      // PNG has no alpha issue, but JPEG needs a solid backdrop.
      if (mime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close?.();

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, mime, q / 100)
      );
      if (!blob) throw new Error("encode failed");

      const ext = FORMATS.find((f) => f.mime === mime)?.ext ?? "img";
      const base = file.name.replace(/\.[^.]+$/, "");
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return {
          url: URL.createObjectURL(blob),
          size: blob.size,
          name: `${base}.${ext}`,
        };
      });
    } catch {
      setError(true);
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError(true);
      return;
    }
    fileRef.current = file;
    setOriginal({ size: file.size, name: file.name });
    convert(file, format, quality);
  }

  function reset() {
    if (result) URL.revokeObjectURL(result.url);
    fileRef.current = null;
    setOriginal(null);
    setResult(null);
    setError(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const lossless = format === "image/png";

  return (
    <div>
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
          if (f) handleFile(f);
        }}
        className={`rounded-xl border border-dashed p-10 text-center transition-colors ${
          dragging ? "border-accent bg-accent/5" : "border-line/60"
        }`}
      >
        <p className="text-sm text-text-soft mb-4">{labels.drop}</p>
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
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {error && <p className="mt-4 text-sm text-accent">{labels.error}</p>}

      {original && (
        <>
          <div className="glass-card mt-6 p-5 grid sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {labels.format}
              </span>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value);
                  if (fileRef.current) convert(fileRef.current, e.target.value, quality);
                }}
                className="w-full mt-2 rounded-lg border border-line/60 bg-surface/60 px-3 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
              >
                {FORMATS.map((f) => (
                  <option key={f.mime} value={f.mime}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={`block ${lossless ? "opacity-40" : ""}`}>
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {labels.quality}: {lossless ? "—" : quality}
              </span>
              <input
                type="range"
                min={40}
                max={100}
                value={quality}
                disabled={lossless}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setQuality(v);
                  if (fileRef.current) convert(fileRef.current, format, v);
                }}
                className="w-full mt-2 accent-[var(--color-accent)]"
              />
            </label>
          </div>

          <div className="glass-card mt-4 p-5">
            {busy ? (
              <p className="text-sm text-muted">{labels.working}</p>
            ) : result ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.url}
                  alt=""
                  className="w-28 h-28 object-cover rounded-lg border border-line/50"
                />
                <div className="flex-1 text-sm space-y-1">
                  <p className="text-muted">
                    {labels.original}:{" "}
                    <span className="text-text-soft">{formatBytes(original.size)}</span>
                  </p>
                  <p className="text-muted">
                    {labels.converted}:{" "}
                    <span className="text-text">{formatBytes(result.size)}</span>
                  </p>
                  <p className="text-muted break-all">{result.name}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={result.url}
                    download={result.name}
                    className="btn-glass px-5 py-2.5 text-sm text-text text-center"
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
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
