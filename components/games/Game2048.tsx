"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Labels = {
  score: string;
  youWin: string;
  gameOver: string;
  restart: string;
  hint: string;
};
type Board = number[][];
type Dir = "up" | "down" | "left" | "right";

const SIZE = 4;

function empty(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function clone(b: Board): Board {
  return b.map((r) => r.slice());
}

function spawn(b: Board): Board {
  const cells: [number, number][] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (b[r][c] === 0) cells.push([r, c]);
  if (cells.length === 0) return b;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  const nb = clone(b);
  nb[r][c] = Math.random() < 0.9 ? 2 : 4;
  return nb;
}

function slide(row: number[]): { row: number[]; gained: number } {
  const nums = row.filter((n) => n !== 0);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      out.push(nums[i] * 2);
      gained += nums[i] * 2;
      i++;
    } else {
      out.push(nums[i]);
    }
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gained };
}

function rotCW(b: Board): Board {
  const n = empty();
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) n[c][SIZE - 1 - r] = b[r][c];
  return n;
}
function rotCCW(b: Board): Board {
  const n = empty();
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) n[SIZE - 1 - c][r] = b[r][c];
  return n;
}

function move(b: Board, dir: Dir): { board: Board; gained: number; moved: boolean } {
  let work = b;
  if (dir === "up") work = rotCCW(b);
  else if (dir === "down") work = rotCW(b);
  else if (dir === "right") work = b.map((r) => r.slice().reverse());

  let gained = 0;
  let slid = work.map((r) => {
    const { row, gained: g } = slide(r);
    gained += g;
    return row;
  });

  if (dir === "up") slid = rotCW(slid);
  else if (dir === "down") slid = rotCCW(slid);
  else if (dir === "right") slid = slid.map((r) => r.slice().reverse());

  const moved = JSON.stringify(slid) !== JSON.stringify(b);
  return { board: slid, gained, moved };
}

function canMove(b: Board): boolean {
  return (["up", "down", "left", "right"] as Dir[]).some((d) => move(b, d).moved);
}

const TILE_CLASS: Record<number, string> = {
  0: "bg-surface/30 text-transparent",
  2: "bg-surface/70 text-text-soft",
  4: "bg-surface text-text-soft",
  8: "bg-accent/20 text-accent",
  16: "bg-accent/30 text-accent",
  32: "bg-accent/40 text-text",
  64: "bg-accent/55 text-text",
  128: "bg-accent/65 text-bg",
  256: "bg-accent/75 text-bg",
  512: "bg-accent/85 text-bg",
  1024: "bg-accent/90 text-bg",
  2048: "bg-accent text-bg",
};

export default function Game2048({ labels }: { labels: Labels }) {
  const [board, setBoard] = useState<Board>(empty);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [over, setOver] = useState(false);
  const boardRef = useRef(board);
  const overRef = useRef(over);
  boardRef.current = board;
  overRef.current = over;

  const start = useCallback(() => {
    let b = spawn(spawn(empty()));
    setBoard(b);
    setScore(0);
    setWon(false);
    setOver(false);
  }, []);

  useEffect(() => {
    start();
  }, [start]);

  const doMove = useCallback((dir: Dir) => {
    if (overRef.current) return;
    const { board: nb, gained, moved } = move(boardRef.current, dir);
    if (!moved) return;
    const withSpawn = spawn(nb);
    setBoard(withSpawn);
    setScore((s) => s + gained);
    if (nb.flat().includes(2048)) setWon(true);
    if (!canMove(withSpawn)) setOver(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        doMove(dir);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

  // Touch swipe
  const touch = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? "right" : "left");
    else doMove(dy > 0 ? "down" : "up");
  }

  const status = over ? labels.gameOver : won ? labels.youWin : `${labels.score}: ${score}`;

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-mono text-sm text-text-soft h-5" aria-live="polite">
        {status}
      </p>

      <div
        className="grid grid-cols-4 gap-2 p-2 rounded-lg bg-line/20 touch-none select-none"
        dir="ltr"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {board.flat().map((v, i) => (
          <div
            key={i}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-md flex items-center justify-center font-serif text-2xl sm:text-3xl ${
              TILE_CLASS[v] ?? "bg-accent text-bg"
            }`}
          >
            {v !== 0 ? v : ""}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted">{labels.hint}</p>

      <button
        type="button"
        onClick={start}
        className="rounded-md border border-line/70 bg-surface/50 px-4 py-2 text-sm text-text-soft transition-colors hover:border-accent/60 hover:text-text"
      >
        {labels.restart}
      </button>
    </div>
  );
}
