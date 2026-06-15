"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/photos";

type Labels = { close: string; prev: string; next: string };

export default function PhotoGallery({
  photos,
  labels,
}: {
  photos: Photo[];
  labels: Labels;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const openAt = useCallback((i: number) => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    setOpen(i);
  }, []);

  const close = useCallback(() => setOpen(null), []);

  // Move focus into the dialog when it opens; restore it when it closes.
  useEffect(() => {
    if (open !== null) {
      closeRef.current?.focus();
    } else {
      lastFocused.current?.focus?.();
    }
  }, [open]);
  const show = useCallback(
    (dir: number) =>
      setOpen((i) => (i === null ? null : (i + dir + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(1);
      else if (e.key === "ArrowLeft") show(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, show]);

  return (
    <>
      <div className="columns-2 md:columns-3 gap-3 [&>*]:mb-3">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => openAt(i)}
            className="block w-full break-inside-avoid overflow-hidden rounded-lg border border-line/50 group"
            aria-label={photo.alt}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={photos[open].alt}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={labels.close}
            className="absolute top-4 right-4 text-text-soft hover:text-text text-2xl leading-none w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); show(-1); }}
            aria-label={labels.prev}
            className="absolute start-2 sm:start-6 text-text-soft hover:text-accent text-3xl w-12 h-12 flex items-center justify-center"
          >
            ‹
          </button>
          <figure className="max-w-4xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[open].src}
              alt={photos[open].alt}
              className="max-h-[78vh] w-auto rounded-lg object-contain"
            />
            {photos[open].caption && (
              <figcaption className="mt-3 text-sm text-text-soft text-center">
                {photos[open].caption}
              </figcaption>
            )}
          </figure>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); show(1); }}
            aria-label={labels.next}
            className="absolute end-2 sm:end-6 text-text-soft hover:text-accent text-3xl w-12 h-12 flex items-center justify-center"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
