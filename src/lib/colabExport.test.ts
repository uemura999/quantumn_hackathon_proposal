import { describe, expect, it } from 'vitest';
import {
  buildColabUploadUrl,
  buildColabUrl,
  buildHandoffSnippet,
  buildNotebookFilename,
  getNotebookAssetPath,
} from './colabExport';

describe('buildColabUrl', () => {
  it('returns a Colab github URL with defaults (handoff)', () => {
    const url = buildColabUrl();
    expect(url.startsWith('https://colab.research.google.com/github/')).toBe(
      true,
    );
    expect(url).toContain('notebooks/qiskit_qaoa_handoff.ipynb');
  });

  it('returns real_city notebook URL when notebook="real_city"', () => {
    const url = buildColabUrl({ notebook: 'real_city' });
    expect(url).toContain('notebooks/qiskit_real_city_challenge_v1.ipynb');
  });

  it('accepts custom owner/repo/branch/path', () => {
    const url = buildColabUrl({
      githubOwner: 'me',
      githubRepo: 'r',
      githubBranch: 'b',
      notebookPath: 'p.ipynb',
    });
    expect(url).toBe(
      'https://colab.research.google.com/github/me/r/blob/b/p.ipynb',
    );
  });
});

describe('buildHandoffSnippet (handoff)', () => {
  it('produces parseable python with required globals', () => {
    const snippet = buildHandoffSnippet({
      params: { gamma: 1.0, beta: 0.4, reps: 2 },
      profile: 'midday',
    });
    expect(snippet).toContain('GAMMA = 1.0');
    expect(snippet).toContain('BETA = 0.4');
    expect(snippet).toContain('REPS = 2');
    expect(snippet).toContain('PROFILE = "midday"');
    expect(snippet).toContain('JS_TOP_ROUTES = []');
  });

  it('encodes team name and labels when provided', () => {
    const snippet = buildHandoffSnippet({
      params: { gamma: 0.8, beta: 0.3, reps: 1 },
      profile: 'morning_rush',
      teamName: 'TeamA',
      labels: ['病院', '学校', '駅', '避難所', 'スタジアム', '工場'],
    });
    expect(snippet).toContain('TEAM_NAME = "TeamA"');
    expect(snippet).toContain('"病院"');
    expect(snippet).toContain('"避難所"');
  });

  it('encodes top routes in python literal form', () => {
    const snippet = buildHandoffSnippet({
      params: { gamma: 1.0, beta: 0.4, reps: 2 },
      profile: 'midday',
      topRoutes: [
        {
          order: [-1, 0, 1, 2, 3, 4, 5, -1],
          distance: 38.4,
          probability: 0.087,
          isValid: true,
          distanceRank: 1,
          deltaFromOptimal: 0,
        },
      ],
    });
    expect(snippet).toContain('JS_TOP_ROUTES = [');
    expect(snippet).toContain('"order": [-1,0,1,2,3,4,5,-1]');
    expect(snippet).toContain('"distance": 38.4');
    expect(snippet).toContain('"probability": 0.087');
  });

  it('limits to top 3 routes', () => {
    const snippet = buildHandoffSnippet({
      params: { gamma: 1.0, beta: 0.4, reps: 2 },
      profile: 'midday',
      topRoutes: Array.from({ length: 10 }, (_, i) => ({
        order: [-1, 0, 1, 2, 3, 4, 5, -1],
        distance: 30 + i,
        probability: 0.1 - i * 0.01,
        isValid: true,
        distanceRank: i + 1,
        deltaFromOptimal: i,
      })),
    });
    const occurrences = snippet.match(/"order":/g) ?? [];
    expect(occurrences.length).toBe(3);
  });
});

describe('buildColabUploadUrl', () => {
  it('returns the Colab upload landing URL', () => {
    expect(buildColabUploadUrl()).toBe(
      'https://colab.research.google.com/?upload=true',
    );
  });
});

describe('buildNotebookFilename', () => {
  it('returns base filename when no team name', () => {
    expect(buildNotebookFilename('real_city')).toBe(
      'qiskit_real_city_challenge_v1.ipynb',
    );
    expect(buildNotebookFilename('handoff')).toBe('qiskit_qaoa_handoff.ipynb');
  });

  it('appends sanitized team name when provided', () => {
    expect(buildNotebookFilename('real_city', 'チーム A')).toBe(
      'qiskit_real_city_challenge_v1_チーム_A.ipynb',
    );
    // 〇 (U+3007 ideographic number zero) is treated as a letter; ASCII spaces become _
    expect(buildNotebookFilename('handoff', '〇〇高校 2-A')).toBe(
      'qiskit_qaoa_handoff_〇〇高校_2-A.ipynb',
    );
  });

  it('strips dangerous characters and trims length', () => {
    const long = 'a'.repeat(100);
    const name = buildNotebookFilename('handoff', long);
    expect(name.length).toBeLessThan(60);
  });
});

describe('getNotebookAssetPath', () => {
  it('returns the public path for each notebook kind', () => {
    expect(getNotebookAssetPath('handoff')).toBe(
      '/notebooks/qiskit_qaoa_handoff.ipynb',
    );
    expect(getNotebookAssetPath('real_city')).toBe(
      '/notebooks/qiskit_real_city_challenge_v1.ipynb',
    );
  });
});

describe('buildHandoffSnippet (real_city)', () => {
  it('emits PLACE_1..PLACE_6 + CITY_NAME + TEAM_NAME', () => {
    const snippet = buildHandoffSnippet({
      params: { gamma: 1.0, beta: 0.4, reps: 2 },
      profile: 'midday',
      notebook: 'real_city',
      teamName: 'チームA',
      cityName: '京都',
      labels: ['京都駅', '清水寺', '金閣寺', '銀閣寺', '嵐山', '二条城'],
    });
    expect(snippet).toContain('TEAM_NAME = "チームA"');
    expect(snippet).toContain('CITY_NAME = "京都"');
    expect(snippet).toContain('PLACE_1 = "京都駅"');
    expect(snippet).toContain('PLACE_6 = "二条城"');
    expect(snippet).toContain('GAMMA = 1.0');
    expect(snippet).not.toContain('JS_TOP_ROUTES');
  });

  it('emits empty PLACE entries when labels missing', () => {
    const snippet = buildHandoffSnippet({
      params: { gamma: 0.5, beta: 0.3, reps: 1 },
      profile: 'midday',
      notebook: 'real_city',
    });
    expect(snippet).toContain('PLACE_1 = ""');
    expect(snippet).toContain('PLACE_6 = ""');
  });
});
