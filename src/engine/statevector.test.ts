import { describe, expect, it } from 'vitest';
import {
  createState,
  applyHadamardAll,
  applyXRotationAll,
  applyPhaseDiagonal,
  probabilities,
} from './statevector';

const EPS = 1e-10;

describe('createState', () => {
  it('initializes |0...0> with real[0]=1, all others zero', () => {
    const state = createState(3);
    expect(state.numQubits).toBe(3);
    expect(state.size).toBe(8);
    expect(state.real[0]).toBe(1);
    expect(state.imag[0]).toBe(0);
    for (let i = 1; i < 8; i++) {
      expect(state.real[i]).toBe(0);
      expect(state.imag[i]).toBe(0);
    }
  });

  it('throws when numQubits is non-positive', () => {
    expect(() => createState(0)).toThrow();
    expect(() => createState(-1)).toThrow();
  });
});

describe('probabilities', () => {
  it('returns 1 at |0> for the initial state', () => {
    const state = createState(2);
    const p = probabilities(state);
    expect(p[0]).toBe(1);
    expect(p[1]).toBe(0);
    expect(p[2]).toBe(0);
    expect(p[3]).toBe(0);
  });

  it('always sums to 1 within tolerance', () => {
    const state = createState(4);
    applyHadamardAll(state);
    const p = probabilities(state);
    const sum = p.reduce((acc, x) => acc + x, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(EPS);
  });
});

describe('applyHadamardAll', () => {
  it('produces uniform superposition from |0...0>', () => {
    const state = createState(3);
    applyHadamardAll(state);
    const expected = 1 / Math.sqrt(8);
    for (let i = 0; i < 8; i++) {
      expect(Math.abs(state.real[i] - expected)).toBeLessThan(EPS);
      expect(state.imag[i]).toBe(0);
    }
  });

  it('is its own inverse (H twice == identity)', () => {
    const state = createState(2);
    applyHadamardAll(state);
    applyHadamardAll(state);
    expect(Math.abs(state.real[0] - 1)).toBeLessThan(EPS);
    for (let i = 1; i < 4; i++) {
      expect(Math.abs(state.real[i])).toBeLessThan(EPS);
      expect(Math.abs(state.imag[i])).toBeLessThan(EPS);
    }
  });
});

describe('applyXRotationAll', () => {
  it('is identity when angle is 0', () => {
    const state = createState(3);
    applyHadamardAll(state);
    const before = Array.from(state.real);
    applyXRotationAll(state, 0);
    for (let i = 0; i < state.size; i++) {
      expect(Math.abs(state.real[i] - before[i])).toBeLessThan(EPS);
      expect(Math.abs(state.imag[i])).toBeLessThan(EPS);
    }
  });

  it('preserves probability normalization', () => {
    const state = createState(3);
    applyHadamardAll(state);
    applyXRotationAll(state, 0.4);
    const p = probabilities(state);
    const sum = p.reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(EPS);
  });
});

describe('applyPhaseDiagonal', () => {
  it('does not change probabilities (only phases)', () => {
    const state = createState(3);
    applyHadamardAll(state);
    const before = probabilities(state);
    const phases = new Float64Array(8);
    for (let i = 0; i < 8; i++) phases[i] = i * 0.13;
    applyPhaseDiagonal(state, phases);
    const after = probabilities(state);
    for (let i = 0; i < 8; i++) {
      expect(Math.abs(after[i] - before[i])).toBeLessThan(EPS);
    }
  });

  it('is identity when all phases are 0', () => {
    const state = createState(2);
    applyHadamardAll(state);
    const before = Array.from(state.real);
    applyPhaseDiagonal(state, new Float64Array(4));
    for (let i = 0; i < 4; i++) {
      expect(Math.abs(state.real[i] - before[i])).toBeLessThan(EPS);
    }
  });
});
