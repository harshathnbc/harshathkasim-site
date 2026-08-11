"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Labels = {
  choose: string;
  latinNote: string;
  modeText: string;
  modeImage: string;
  modeMove: string;
  hintText: string;
  hintImage: string;
  hintMove: string;
  textContent: string;
  fontSize: string;
  colour: string;
  imageWidth: string;
  chooseImage: string;
  prev: string;
  next: string;
  pageOf: string;
  rotateLeft: string;
  rotateRight: string;
  deletePage: string;
  deleteItem: string;
  itemsOnPage: string;
  save: string;
  working: string;
  download: string;
  reset: string;
  error: string;
  encrypted: string;
};

type Anno =
  | {
      id: number;
      page: number;
      kind: "text";
      x: number;
      y: number;
      text: string;
      size: number;
      colour: string;
    }
  | {
      id: number;
      page: number;
      kind: "image";
      x: number;
      y: number;
      width: number;
      dataUrl: string;
      mime: string;
    };

type Mode = "text" | "image" | "move";

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

export default function PdfEditor({ labels }: { labels: Labels }) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [annos, setAnnos] = useState<Anno[]>([]);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [deleted, setDeleted] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("Signed");
  const [size, setSize] = useState(18);
  const [colour, setColour] = useState("#c8102e");
  const [imgWidth, setImgWidth] = useState(140);
  const [stamp, setStamp] = useState<{ dataUrl: string; mime: string } | null>(null);
  const [output, setOutput] = useState<{ url: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bumped whenever a new document loads, so the render effect re-runs even
  // when the page number happens to be unchanged.
  const [docVersion, setDocVersion] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const viewportRef = useRef<import("pdfjs-dist").PageViewport | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const imgInput = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  const visiblePages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => !deleted.has(p)
  );

  async function loadPdfjs() {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    return pdfjs;
  }

  const render = useCallback(async () => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas || !page) return;
    const p = await doc.getPage(page);
    const extra = rotations[page] ?? 0;
    // Fit the page to the available width, capped for very large screens.
    const maxW = Math.min(wrapRef.current?.clientWidth ?? 640, 720);
    const base = p.getViewport({ scale: 1, rotation: (p.rotate + extra) % 360 });
    const scale = maxW / base.width;
    const viewport = p.getViewport({ scale, rotation: (p.rotate + extra) % 360 });
    viewportRef.current = viewport;
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await p.render({ canvas, canvasContext: ctx, viewport }).promise;
  }, [page, rotations, docVersion]);

  useEffect(() => {
    render();
  }, [render]);

  async function pick(f: File) {
    if (f.type !== "application/pdf") {
      setError(labels.error);
      return;
    }
    setError(null);
    setOutput(null);
    setAnnos([]);
    setRotations({});
    setDeleted(new Set());
    try {
      const pdfjs = await loadPdfjs();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) })
        .promise;
      docRef.current = doc;
      setFile(f);
      setPageCount(doc.numPages);
      setPage(1);
      setDocVersion((v) => v + 1);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(/password|encrypt/i.test(msg) ? labels.encrypted : labels.error);
    }
  }

  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const vp = viewportRef.current;
    const canvas = canvasRef.current;
    if (!vp || !canvas || mode === "move") return;
    const rect = canvas.getBoundingClientRect();
    // Canvas may be displayed smaller than its backing store.
    const cx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const cy = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const [px, py] = vp.convertToPdfPoint(cx, cy);

    if (mode === "text") {
      if (!text.trim()) return;
      setAnnos((a) => [
        ...a,
        { id: nextId.current++, page, kind: "text", x: px, y: py, text, size, colour },
      ]);
    } else if (mode === "image" && stamp) {
      setAnnos((a) => [
        ...a,
        {
          id: nextId.current++,
          page,
          kind: "image",
          x: px,
          y: py,
          width: imgWidth,
          dataUrl: stamp.dataUrl,
          mime: stamp.mime,
        },
      ]);
    }
  }

  function loadStamp(f: File) {
    const reader = new FileReader();
    reader.onload = () =>
      setStamp({ dataUrl: String(reader.result), mime: f.type });
    reader.readAsDataURL(f);
    setMode("image");
  }

  async function save() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");
      const doc = await PDFDocument.load(await file.arrayBuffer(), {
        ignoreEncryption: true,
      });
      const font = await doc.embedFont(StandardFonts.Helvetica);

      for (const a of annos) {
        const target = doc.getPage(a.page - 1);
        // Counter-rotate so content sits upright on a rotated page.
        const rot = target.getRotation().angle;
        if (a.kind === "text") {
          const c = hexToRgb(a.colour);
          target.drawText(a.text, {
            x: a.x,
            y: a.y,
            size: a.size,
            font,
            color: rgb(c.r, c.g, c.b),
            rotate: degrees(-rot),
          });
        } else {
          const bytes = Uint8Array.from(
            atob(a.dataUrl.split(",")[1]),
            (ch) => ch.charCodeAt(0)
          );
          const img = /png/i.test(a.mime)
            ? await doc.embedPng(bytes)
            : await doc.embedJpg(bytes);
          const ratio = img.height / img.width;
          target.drawImage(img, {
            x: a.x,
            y: a.y - a.width * ratio,
            width: a.width,
            height: a.width * ratio,
            rotate: degrees(-rot),
          });
        }
      }

      // Apply rotations, then remove deleted pages from the end backwards.
      for (const [p, extra] of Object.entries(rotations)) {
        const idx = Number(p) - 1;
        const target = doc.getPage(idx);
        target.setRotation(degrees((target.getRotation().angle + extra) % 360));
      }
      [...deleted]
        .sort((x, y) => y - x)
        .forEach((p) => doc.removePage(p - 1));

      const bytes = await doc.save();
      const blob = new Blob([bytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      setOutput((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return {
          url: URL.createObjectURL(blob),
          name: file.name.replace(/\.pdf$/i, "") + "-edited.pdf",
        };
      });
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (output) URL.revokeObjectURL(output.url);
    setFile(null);
    setOutput(null);
    setAnnos([]);
    setRotations({});
    setDeleted(new Set());
    setPageCount(0);
    docRef.current = null;
    if (fileInput.current) fileInput.current.value = "";
  }

  const pageAnnos = annos.filter((a) => a.page === page);
  const posInList = visiblePages.indexOf(page);

  return (
    <div className="space-y-6">
      <p className="text-sm text-accent">{labels.latinNote}</p>

      {!file ? (
        <div className="rounded-xl border border-dashed border-line/60 p-10 text-center">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="btn-glass px-5 py-2.5 text-sm text-text"
          >
            {labels.choose}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])}
          />
        </div>
      ) : (
        <>
          {/* Mode switch */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["text", labels.modeText],
                ["image", labels.modeImage],
                ["move", labels.modeMove],
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

          {/* Mode options */}
          <div className="glass-card p-5 space-y-4">
            {mode === "text" && (
              <>
                <p className="text-xs text-muted">{labels.hintText}</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <label className="block sm:col-span-1">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted">
                      {labels.textContent}
                    </span>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full mt-2 rounded-lg border border-line/60 bg-surface/60 px-3 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted">
                      {labels.fontSize}: {size}
                    </span>
                    <input
                      type="range"
                      min={8}
                      max={48}
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full mt-2 accent-[var(--color-accent)]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted">
                      {labels.colour}
                    </span>
                    <input
                      type="color"
                      value={colour}
                      onChange={(e) => setColour(e.target.value)}
                      className="w-full mt-2 h-9 rounded-lg border border-line/60 bg-surface/60"
                    />
                  </label>
                </div>
              </>
            )}

            {mode === "image" && (
              <>
                <p className="text-xs text-muted">{labels.hintImage}</p>
                <div className="flex flex-wrap items-end gap-4">
                  <button
                    type="button"
                    onClick={() => imgInput.current?.click()}
                    className="btn-glass px-4 py-2 text-sm text-text"
                  >
                    {labels.chooseImage}
                  </button>
                  <input
                    ref={imgInput}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    onChange={(e) => e.target.files?.[0] && loadStamp(e.target.files[0])}
                  />
                  {stamp && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={stamp.dataUrl}
                      alt=""
                      className="h-10 w-auto rounded border border-line/50 bg-white"
                    />
                  )}
                  <label className="block flex-1 min-w-[10rem]">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted">
                      {labels.imageWidth}: {imgWidth}
                    </span>
                    <input
                      type="range"
                      min={40}
                      max={400}
                      value={imgWidth}
                      onChange={(e) => setImgWidth(Number(e.target.value))}
                      className="w-full mt-2 accent-[var(--color-accent)]"
                    />
                  </label>
                </div>
              </>
            )}

            {mode === "move" && <p className="text-xs text-muted">{labels.hintMove}</p>}
          </div>

          {/* Page canvas */}
          <div ref={wrapRef} className="glass-card p-4">
            <canvas
              ref={canvasRef}
              onClick={onCanvasClick}
              className={`w-full h-auto rounded-lg bg-white ${
                mode === "move" ? "cursor-default" : "cursor-crosshair"
              }`}
            />
          </div>

          {/* Page controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={posInList <= 0}
              onClick={() => setPage(visiblePages[posInList - 1])}
              className="btn-glass px-3 py-1.5 text-xs text-text-soft disabled:opacity-40"
            >
              {labels.prev}
            </button>
            <span className="text-xs text-muted px-2">
              {labels.pageOf
                .replace("{n}", String(posInList + 1))
                .replace("{total}", String(visiblePages.length))}
            </span>
            <button
              type="button"
              disabled={posInList >= visiblePages.length - 1}
              onClick={() => setPage(visiblePages[posInList + 1])}
              className="btn-glass px-3 py-1.5 text-xs text-text-soft disabled:opacity-40"
            >
              {labels.next}
            </button>

            <span className="w-px h-6 bg-line/60 mx-2" aria-hidden />

            <button
              type="button"
              onClick={() =>
                setRotations((r) => ({ ...r, [page]: ((r[page] ?? 0) + 270) % 360 }))
              }
              className="btn-glass px-3 py-1.5 text-xs text-text-soft"
            >
              {labels.rotateLeft}
            </button>
            <button
              type="button"
              onClick={() =>
                setRotations((r) => ({ ...r, [page]: ((r[page] ?? 0) + 90) % 360 }))
              }
              className="btn-glass px-3 py-1.5 text-xs text-text-soft"
            >
              {labels.rotateRight}
            </button>
            <button
              type="button"
              disabled={visiblePages.length <= 1}
              onClick={() => {
                const next = new Set(deleted).add(page);
                setDeleted(next);
                setAnnos((a) => a.filter((x) => x.page !== page));
                const remaining = visiblePages.filter((p) => p !== page);
                setPage(remaining[Math.min(posInList, remaining.length - 1)]);
              }}
              className="btn-glass px-3 py-1.5 text-xs text-text-soft disabled:opacity-40"
            >
              {labels.deletePage}
            </button>
          </div>

          {/* Items on this page */}
          {pageAnnos.length > 0 && (
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted mb-3">
                {labels.itemsOnPage}
              </p>
              <ul className="space-y-2">
                {pageAnnos.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 text-text-soft truncate">
                      {a.kind === "text" ? `“${a.text}”` : "🖋"}{" "}
                      <span className="text-muted text-xs">
                        ({Math.round(a.x)}, {Math.round(a.y)})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAnnos((list) => list.filter((x) => x.id !== a.id))}
                      className="text-xs text-muted hover:text-accent"
                    >
                      {labels.deleteItem}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="btn-glass px-5 py-2.5 text-sm text-text disabled:opacity-40"
            >
              {busy ? labels.working : labels.save}
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted hover:text-text self-center"
            >
              {labels.reset}
            </button>
          </div>
        </>
      )}

      {error && <p className="text-sm text-accent">{error}</p>}

      {output && (
        <div className="glass-card p-5 flex flex-wrap items-center gap-4">
          <p className="flex-1 text-sm text-text break-all">{output.name}</p>
          <a
            href={output.url}
            download={output.name}
            className="btn-glass px-5 py-2.5 text-sm text-text"
          >
            {labels.download}
          </a>
        </div>
      )}
    </div>
  );
}
