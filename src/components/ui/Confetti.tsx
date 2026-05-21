'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/lib/reducedMotion';

interface ConfettiProps {
  readonly trigger: number;
}

interface Particle {
  readonly id: number;
  readonly x: number;
  readonly delay: number;
  readonly hue: number;
  readonly drift: number;
}

const COLORS = ['#D97757', '#F0A878', '#E8C77B', '#9DBDB4', '#3A4564'];

function buildParticles(): ReadonlyArray<Particle> {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    delay: Math.random() * 0.4,
    hue: Math.floor(Math.random() * COLORS.length),
    drift: (Math.random() - 0.5) * 60,
  }));
}

export function Confetti({ trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<ReadonlyArray<Particle>>([]);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (trigger === 0) return;
    if (prefersReduced) return;
    setParticles(buildParticles());
    const id = window.setTimeout(() => setParticles([]), 2400);
    return () => window.clearTimeout(id);
  }, [trigger, prefersReduced]);

  if (particles.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute block"
          style={{
            top: '-20px',
            left: `${p.x}%`,
            width: '8px',
            height: '12px',
            background: COLORS[p.hue],
            borderRadius: '2px',
            animation: `confetti-fall 1.8s cubic-bezier(0.16, 1, 0.3, 1) ${p.delay}s forwards`,
            transform: `translateX(${p.drift}px)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift, 0px), 110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
