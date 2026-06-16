"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Labels = { score: string; gameOver: string; restart: string; hint: string };
type P = { x: number; y: number };

const N = 15;

function randFood(snake: P[]): P {
  let f: P;
  do {
    f = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
  } while (snake.some((s) => s.x === f.x && s.y === f.y));
  return f;
}

export default function Snake({ labels }: { labels: Labels }) {
  const [snake, setSnake] = useState<P[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<P>({ x: 4, y: 7 });
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);

  const dir = useRef<P>({ x: 1, y: 0 });
  const queued = useRef<P>({ x: 1, y: 0 });
  const foodRef = useRef(food);
  const runningRef = useRef(running);
  const overRef = useRef(over);
  foodRef.current = food;
  runningRef.current = running;
  overRef.current = over;

  const reset = useCallback(() => {
    const init = [{ x: 7, y: 7 }];
    setSnake(init);
    setFood(randFood(init));
    setScore(0);
    setOver(false);
    dir.current = { x: 1, y: 0 };
    queued.current = { x: 1, y: 0 };
    setRunning(true);
  }, []);

  const tick = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    dir.current = queued.current;
    setSnake((prev) => {
      const head = { x: prev[0].x + dir.current.x, y: prev[0].y + dir.current.y };
      const hitsWall = head.x < 0 || head.x >= N || head.y < 0 || head.y >= N;
      const hitsSelf = prev.some((s) => s.x === head.x && s.y === head.y);
      if (hitsWall || hitsSelf) {
        setOver(true);
        setRunning(false);
        return prev;
      }
      const ate = head.x === foodRef.current.x && head.y === foodRef.current.y;
      const next = [head, ...prev];
      if (ate) {
        setScore((s) => s + 1);
        setFood(randFood(next));
      } else {
        next.pop();
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 140);
    return () => clearInterval(id);
  }, [running, tick]);

  const steer = useCallback((d: P) => {
    if (d.x === -dir.current.x && d.y === -dir.current.y) return;
    queued.current = d;
    if (!runningRef.current && !overRef.current) setRunning(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const m: Record<string, P> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      const d = m[e.key];
      if (!d) return;
      e.preventDefault();
      steer(d);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steer]);

  const touch = useRef<P | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) steer({ x: dx > 0 ? 1 : -1, y: 0 });
    else steer({ x: 0, y: dy > 0 ? 1 : -1 });
  }

  const occ = new Set(snake.map((s) => `${s.x},${s.y}`));
  const headKey = `${snake[0].x},${snake[0].y}`;
  const foodKey = `${food.x},${food.y}`;

  const status = over
    ? `${labels.gameOver} — ${labels.score}: ${score}`
    : `${labels.score}: ${score}`;

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-mono text-sm text-text-soft h-5" aria-live="polite">
        {status}
      </p>

      <div
        className="grid gap-px bg-line/30 rounded-md p-px touch-none select-none w-full max-w-[330px] aspect-square"
        dir="ltr"
        style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {Array.from({ length: N * N }, (_, i) => {
          const x = i % N;
          const y = Math.floor(i / N);
          const key = `${x},${y}`;
          const isHead = key === headKey;
          const isBody = occ.has(key);
          const isFood = key === foodKey;
          return (
            <div
              key={i}
              className={`aspect-square ${
                isHead
                  ? "bg-accent"
                  : isBody
                    ? "bg-accent/60"
                    : isFood
                      ? "bg-text/80 rounded-full"
                      : "bg-surface/40"
              }`}
            />
          );
        })}
      </div>

      <p className="text-xs text-muted">{labels.hint}</p>

      <button
        type="button"
        onClick={reset}
        className="btn-glass px-4 py-2 text-sm text-text-soft"
      >
        {labels.restart}
      </button>
    </div>
  );
}
