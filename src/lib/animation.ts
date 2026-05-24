export const easeOutExpo = (t: number): number => {
  if (t >= 1) return 1;
  return 1 - Math.pow(2, -10 * t);
};

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const formatDistance = (distance: number): string =>
  `${distance.toFixed(2)} 距離pt`;

export const formatTimeLeft = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};
