import type { QaoaParams, RouteCandidate } from '@/engine/types';
import type { TrafficProfileName } from '@/engine/city-layout';

export type NotebookKind = 'handoff' | 'real_city';

export interface ColabHandoffPayload {
  readonly params: QaoaParams;
  readonly profile: TrafficProfileName;
  readonly teamName?: string;
  readonly cityName?: string;
  readonly labels?: ReadonlyArray<string>;
  readonly topRoutes?: ReadonlyArray<RouteCandidate>;
  readonly notebook?: NotebookKind;
}

interface ColabUrlConfig {
  readonly githubOwner?: string;
  readonly githubRepo?: string;
  readonly githubBranch?: string;
  readonly notebookPath?: string;
  readonly notebook?: NotebookKind;
}

const DEFAULT_CONFIG = {
  githubOwner: 'NTT-WEST-DENSO',
  githubRepo: 'quantum-hackathon',
  githubBranch: 'main',
} as const;

const NOTEBOOK_PATHS: Readonly<Record<NotebookKind, string>> = {
  handoff: 'notebooks/qiskit_qaoa_handoff.ipynb',
  real_city: 'notebooks/qiskit_real_city_challenge_v1.ipynb',
};

export const COLAB_GENERIC_URL =
  'https://colab.research.google.com/#create=true';

export function buildColabUrl(config: ColabUrlConfig = {}): string {
  const owner = config.githubOwner ?? DEFAULT_CONFIG.githubOwner;
  const repo = config.githubRepo ?? DEFAULT_CONFIG.githubRepo;
  const branch = config.githubBranch ?? DEFAULT_CONFIG.githubBranch;
  const notebookKind = config.notebook ?? 'handoff';
  const notebookPath = config.notebookPath ?? NOTEBOOK_PATHS[notebookKind];
  const path = `${owner}/${repo}/blob/${branch}/${notebookPath}`;
  return `https://colab.research.google.com/github/${path}`;
}

export function buildHandoffSnippet(payload: ColabHandoffPayload): string {
  const notebookKind = payload.notebook ?? 'handoff';
  return notebookKind === 'real_city'
    ? buildRealCitySnippet(payload)
    : buildHandoffSnippetImpl(payload);
}

function buildHandoffSnippetImpl(payload: ColabHandoffPayload): string {
  const { params, profile, teamName, labels, topRoutes } = payload;
  const lines: string[] = [];
  lines.push('# ============================================');
  lines.push('# Web アプリからのパラメータ (handoff)');
  lines.push('# ============================================');
  lines.push(`GAMMA = ${formatNumber(params.gamma)}`);
  lines.push(`BETA = ${formatNumber(params.beta)}`);
  lines.push(`REPS = ${params.reps}`);
  lines.push(`PROFILE = ${JSON.stringify(profile)}`);
  if (teamName && teamName.trim().length > 0) {
    lines.push(`TEAM_NAME = ${JSON.stringify(teamName)}`);
  } else {
    lines.push("TEAM_NAME = ''");
  }
  if (labels && labels.length > 0) {
    lines.push(`LABELS = ${JSON.stringify(labels)}`);
  } else {
    lines.push('LABELS = None');
  }
  if (topRoutes && topRoutes.length > 0) {
    lines.push('JS_TOP_ROUTES = [');
    for (const r of topRoutes.slice(0, 3)) {
      lines.push(
        `    {"order": ${JSON.stringify(Array.from(r.order))}, ` +
          `"distance": ${formatNumber(r.distance)}, ` +
          `"probability": ${formatNumber(r.probability)}},`,
      );
    }
    lines.push(']');
  } else {
    lines.push('JS_TOP_ROUTES = []');
  }
  lines.push('# ============================================');
  return lines.join('\n');
}

function buildRealCitySnippet(payload: ColabHandoffPayload): string {
  const { params, teamName, cityName, labels } = payload;
  const lines: string[] = [];
  lines.push('# ============================================');
  lines.push('# Web アプリからのパラメータ (real_city)');
  lines.push('# このスニペットを Notebook の ②③⑧ セルに貼り付け');
  lines.push('# ============================================');
  lines.push(`TEAM_NAME = ${JSON.stringify(teamName ?? '')}`);
  lines.push(`CITY_NAME = ${JSON.stringify(cityName ?? '')}`);
  const placeholders = labels && labels.length === 6 ? labels : null;
  for (let i = 0; i < 6; i++) {
    const value = placeholders ? placeholders[i] : '';
    lines.push(`PLACE_${i + 1} = ${JSON.stringify(value)}`);
  }
  lines.push('');
  lines.push(`GAMMA = ${formatNumber(params.gamma)}`);
  lines.push(`BETA = ${formatNumber(params.beta)}`);
  lines.push(`REPS = ${params.reps}`);
  lines.push('# ============================================');
  return lines.join('\n');
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return `${value}.0`;
  return value.toString();
}

export async function copyHandoffToClipboard(
  payload: ColabHandoffPayload,
): Promise<{ ok: boolean; reason?: string }> {
  const snippet = buildHandoffSnippet(payload);
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return { ok: false, reason: 'clipboard_api_unavailable' };
  }
  try {
    await navigator.clipboard.writeText(snippet);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'unknown',
    };
  }
}

export function openColab(config: ColabUrlConfig = {}): void {
  if (typeof window === 'undefined') return;
  const url = buildColabUrl(config);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export const COLAB_UPLOAD_URL = 'https://colab.research.google.com/?upload=true';

export function buildColabUploadUrl(): string {
  return COLAB_UPLOAD_URL;
}

export function buildNotebookFilename(
  kind: NotebookKind,
  teamName?: string,
): string {
  const safeTeam = (teamName ?? '')
    .replace(/[^\p{L}\p{N}_-]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24);
  const base =
    kind === 'real_city'
      ? 'qiskit_real_city_challenge_v1'
      : 'qiskit_qaoa_handoff';
  return safeTeam.length > 0 ? `${base}_${safeTeam}.ipynb` : `${base}.ipynb`;
}

export function getNotebookAssetPath(kind: NotebookKind): string {
  return `/${NOTEBOOK_PATHS[kind]}`;
}

export async function downloadNotebook(
  kind: NotebookKind,
  filenameHint?: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { ok: false, reason: 'no_dom' };
  }
  try {
    const src = getNotebookAssetPath(kind);
    const res = await fetch(src);
    if (!res.ok) {
      return { ok: false, reason: `http_${res.status}` };
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filenameHint ?? buildNotebookFilename(kind);
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'unknown',
    };
  }
}
