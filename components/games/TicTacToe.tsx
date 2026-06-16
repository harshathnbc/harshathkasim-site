"use client";

import { useState } from "react";

type Cell = "X" | "O" | null;
type Labels = {
  yourTurn: string;
  thinking: string;
  youWin: string;
  aiWins: string;
  draw: string;
  restart: string;
};

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(b: Cell[]): Cell {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}

function isFull(b: Cell[]) {
  return b.every((c) => c !== null);
}

// Minimax: AI is "O", human is "X". AI maximises.
function minimax(b: Cell[], isAi: boolean): number {
  const w = winner(b);
  if (w === "O") return 1;
  if (w === "X") return -1;
  if (isFull(b)) return 0;

  const scores: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (b[i] === null) {
      b[i] = isAi ? "O" : "X";
      scores.push(minimax(b, !isAi));
      b[i] = null;
    }
  }
  return isAi ? Math.max(...scores) : Math.min(...scores);
}

function bestMove(b: Cell[]): number {
  let best = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (b[i] === null) {
      b[i] = "O";
      const score = minimax(b, false);
      b[i] = null;
      if (score > best) {
        best = score;
        move = i;
      }
    }
  }
  return move;
}

export default function TicTacToe({ labels }: { labels: Labels }) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [busy, setBusy] = useState(false);

  const win = winner(board);
  const full = isFull(board);
  const over = win !== null || full;

  const status = win === "X"
    ? labels.youWin
    : win === "O"
      ? labels.aiWins
      : full
        ? labels.draw
        : busy
          ? labels.thinking
          : labels.yourTurn;

  function play(i: number) {
    if (board[i] || over || busy) return;
    const next = board.slice();
    next[i] = "X";
    setBoard(next);

    if (winner(next) || isFull(next)) return;

    setBusy(true);
    // Small delay so the AI move feels deliberate.
    setTimeout(() => {
      const move = bestMove(next);
      if (move >= 0) {
        const after = next.slice();
        after[move] = "O";
        setBoard(after);
      }
      setBusy(false);
    }, 350);
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-mono text-sm text-text-soft h-5" aria-live="polite">
        {status}
      </p>

      <div className="grid grid-cols-3 gap-2" dir="ltr">
        {board.map((cell, i) => (
          <button
            key={i}
            type="button"
            onClick={() => play(i)}
            disabled={!!cell || over || busy}
            aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ""}`}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-line/60 bg-surface/40 font-serif text-4xl flex items-center justify-center transition-colors enabled:hover:border-accent/50 enabled:hover:bg-surface/70 disabled:cursor-default"
          >
            <span className={cell === "X" ? "text-text" : "text-accent"}>{cell}</span>
          </button>
        ))}
      </div>

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
