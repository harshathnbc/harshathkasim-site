"use client";

import { useEffect, useState } from "react";

type Labels = { moves: string; youWin: string; restart: string };
type Card = { id: number; symbol: string };

const SYMBOLS = ["★", "✦", "●", "■", "▲", "◆", "♥", "✚"];

function makeDeck(): Card[] {
  const deck = [...SYMBOLS, ...SYMBOLS].map((symbol, id) => ({ id, symbol }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function Memory({ labels }: { labels: Labels }) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    setDeck(makeDeck());
  }, []);

  const won = deck.length > 0 && matched.length === deck.length;

  function flip(index: number) {
    if (lock || flipped.includes(index) || matched.includes(index)) return;
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      setLock(true);
      const [a, b] = next;
      const isMatch = deck[a].symbol === deck[b].symbol;
      setTimeout(
        () => {
          if (isMatch) setMatched((m) => [...m, a, b]);
          setFlipped([]);
          setLock(false);
        },
        isMatch ? 450 : 800
      );
    }
  }

  function reset() {
    setDeck(makeDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLock(false);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-mono text-sm text-text-soft h-5" aria-live="polite">
        {won ? `${labels.youWin} (${moves} ${labels.moves})` : `${moves} ${labels.moves}`}
      </p>

      <div className="grid grid-cols-4 gap-2" dir="ltr">
        {deck.map((card, i) => {
          const isUp = flipped.includes(i) || matched.includes(i);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(i)}
              disabled={isUp || lock}
              aria-label={isUp ? card.symbol : "card"}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border flex items-center justify-center text-3xl transition-colors ${
                isUp
                  ? "border-accent/50 bg-surface/70 text-accent"
                  : "border-line/60 bg-surface/40 text-transparent hover:border-accent/40"
              } ${matched.includes(i) ? "opacity-50" : ""}`}
            >
              {isUp ? card.symbol : "•"}
            </button>
          );
        })}
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
