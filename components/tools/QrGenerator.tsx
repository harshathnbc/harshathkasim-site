"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

type Labels = {
  inputLabel: string;
  placeholder: string;
  size: string;
  download: string;
  empty: string;
};

export default function QrGenerator({ labels }: { labels: Labels }) {
  const [text, setText] = useState("https://harshathkasim.com");
  const [size, setSize] = useState(512);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!text.trim()) {
      setReady(false);
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    await QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#000000ff", light: "#ffffffff" },
    });
    setReady(true);
  }, [text, size]);

  useEffect(() => {
    draw();
  }, [draw]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "qr-code.png";
    a.click();
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-5">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            {labels.inputLabel}
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            dir="ltr"
            placeholder={labels.placeholder}
            className="w-full mt-2 rounded-lg border border-line/60 bg-surface/50 px-3 py-2 text-sm text-text placeholder:text-muted focus:border-accent/60 focus:outline-none resize-y"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            {labels.size}: {size}px
          </span>
          <input
            type="range"
            min={128}
            max={1024}
            step={64}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full mt-2 accent-[var(--color-accent)]"
          />
        </label>

        <button
          type="button"
          onClick={download}
          disabled={!ready}
          className="btn-glass px-5 py-2.5 text-sm text-text disabled:opacity-40"
        >
          {labels.download}
        </button>
      </div>

      <div className="glass-card p-5 flex items-center justify-center min-h-[16rem]">
        {/* Canvas keeps a white quiet zone so the code always scans. */}
        <canvas
          ref={canvasRef}
          className={`max-w-full h-auto rounded-lg ${ready ? "" : "hidden"}`}
        />
        {!ready && <p className="text-sm text-muted">{labels.empty}</p>}
      </div>
    </div>
  );
}
