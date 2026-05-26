import { beforeEach, describe, expect, it } from 'vitest';
import { runQaoa } from '@/engine/qaoa';
import { defaultCityProblem } from '@/engine/tsp';
import { useSessionStore } from './sessionStore';

const problem = defaultCityProblem();

function baselineResult() {
  return runQaoa(problem, { gamma: 0.5, beta: 0.3, reps: 1 });
}

function tunedResult() {
  return runQaoa(problem, {
    gamma: Math.PI,
    beta: Math.PI / 2,
    reps: 3,
  });
}

describe('sessionStore expected-distance scoring', () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
  });

  it('updates a best score when expected distance improves despite identical top rank', () => {
    const baseline = baselineResult();
    const tuned = tunedResult();

    expect(baseline.bestValid?.distanceRank).toBe(1);
    expect(tuned.bestValid?.distanceRank).toBe(1);
    expect(tuned.expectedDistance).toBeLessThan(baseline.expectedDistance);

    useSessionStore.getState().recordAttempt(baseline, baseline.bestValid);
    const outcome = useSessionStore
      .getState()
      .recordAttempt(tuned, tuned.bestValid);

    expect(outcome.isNewBest).toBe(true);
    expect(useSessionStore.getState().bestScore?.expectedDistance).toBe(
      tuned.expectedDistance,
    );
    expect(useSessionStore.getState().bestScore?.params).toEqual(tuned.params);
  });

  it('does not replace a better expected score with a lucky sampled route', () => {
    const better = tunedResult();
    const worse = baselineResult();
    const observedFromBetter = better.distribution.find(
      (candidate) => candidate.distanceRank > 1,
    );
    const luckyFromWorse = worse.distribution.find(
      (candidate) => candidate.distanceRank === 1,
    );

    expect(observedFromBetter).toBeDefined();
    expect(luckyFromWorse).toBeDefined();

    useSessionStore
      .getState()
      .recordAttempt(better, observedFromBetter ?? null);
    const outcome = useSessionStore
      .getState()
      .recordAttempt(worse, luckyFromWorse ?? null);

    const state = useSessionStore.getState();
    expect(outcome.isNewBest).toBe(false);
    expect(state.bestScore?.expectedDistance).toBe(better.expectedDistance);
    expect(state.bestScore?.sampledRoute).toEqual(observedFromBetter);
    expect(state.history[1].expectedDistance).toBe(worse.expectedDistance);
    expect(state.history[1].sampledRoute).toEqual(luckyFromWorse);
  });
});
