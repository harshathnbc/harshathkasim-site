"use client";

import { useRef, useState } from "react";

type Labels = {
  drop: string;
  choose: string;
  maxWidth: string;
  quality: string;
  format: string;
  original: string;
  optimized: string;
  saved: string;
  download: string;
  reset: string;
  working: string;
  error: string;
};

type Result = {
  url: string;
  blob: Blob;
  width: number;
  height: number;
  name: string;
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function ImageOptimizer({ labels }: { labels: Labels }) {
  const [original, setOriginal] = useState<{ size: number; name: string } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [maxWidth, setMaxWidth] = useState(2000);
  const [quality, setQuality] = useState(82);
  const [format, setFormat] = useState<"image/webp" | "image/jpeg">("image/webp");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function process(file: File, w: number, q: number, fmt: string) {
    setBusy(true);
    setError(false);
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, w / bitmap.width);
      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas context");
      ctx.drawImage(bitmap, 0, 0, width, height);
      bitmap.close?.();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, fmt, q / 100)
      );
      if (!blob) throw new Error("encode failed");

      const ext = fmt === "image/webp" ? "webp" : "jpg";
      const base = file.name.replace(/\.[^.]+$/, "");
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return {
          url: URL.createObjectURL(blob),
          blob,
          width,
          height,
          name: `${base}-optimised.${ext}`,
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
    process(file, maxWidth, quality, format);
  }

  function reprocess(w: number, q: number, fmt: typeof format) {
    if (fileRef.current) process(fileRef.current, w, q, fmt);
  }

  function reset() {
    if (result) URL.revokeObjectURL(result.url);
    fileRef.current = null;
    setOriginal(null);
    setResult(null);
    setError(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const savedPct =
    original && result
      ? Math.max(0, Math.round((1 - result.blob.size / original.size) * 100))
      : 0;

  return (
    <div>
      {/* Drop zone */}
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
          {/* Controls */}
          <div className="glass-card mt-6 p-5 grid sm:grid-cols-3 gap-5">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {labels.maxWidth}: {maxWidth}px
              </span>
              <input
                type="range"
                min={400}
                max={4000}
                step={100}
                value={maxWidth}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMaxWidth(v);
                  reprocess(v, quality, format);
                }}
                className="w-full mt-2 accent-[var(--color-accent)]"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {labels.quality}: {quality}
              </span>
              <input
                type="range"
                min={40}
                max={100}
                value={quality}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setQuality(v);
                  reprocess(maxWidth, v, format);
                }}
                className="w-full mt-2 accent-[var(--color-accent)]"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {labels.format}
              </span>
              <select
                value={format}
                onChange={(e) => {
                  const v = e.target.value as typeof format;
                  setFormat(v);
                  reprocess(maxWidth, quality, v);
                }}
                className="w-full mt-2 rounded-lg border border-line/60 bg-surface/60 px-3 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
              >
                <option value="image/webp">WebP</option>
                <option value="image/jpeg">JPEG</option>
              </select>
            </label>
          </div>

          {/* Result */}
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
                    {labels.optimized}:{" "}
                    <span className="text-text">{formatBytes(result.blob.size)}</span>{" "}
                    <span className="text-muted">
                      ({result.width}×{result.height})
                    </span>
                  </p>
                  {savedPct > 0 && (
                    <p className="text-accent">
                      {labels.saved} {savedPct}%
                    </p>
                  )}
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
