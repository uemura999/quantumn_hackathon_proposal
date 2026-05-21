export interface StateVector {
  readonly numQubits: number;
  readonly size: number;
  readonly real: Float64Array;
  readonly imag: Float64Array;
}

export function createState(numQubits: number): StateVector {
  if (!Number.isInteger(numQubits) || numQubits <= 0) {
    throw new Error(`numQubits must be a positive integer, got ${numQubits}`);
  }
  const size = 1 << numQubits;
  const real = new Float64Array(size);
  const imag = new Float64Array(size);
  real[0] = 1;
  return { numQubits, size, real, imag };
}

export function probabilities(state: StateVector): Float64Array {
  const { real, imag, size } = state;
  const result = new Float64Array(size);
  for (let i = 0; i < size; i++) {
    result[i] = real[i] * real[i] + imag[i] * imag[i];
  }
  return result;
}

export function applyHadamardAll(state: StateVector): void {
  for (let qubit = 0; qubit < state.numQubits; qubit++) {
    applyHadamard(state, qubit);
  }
}

function applyHadamard(state: StateVector, qubit: number): void {
  const { real, imag, size } = state;
  const bit = 1 << qubit;
  const inv = 1 / Math.SQRT2;

  for (let i = 0; i < size; i++) {
    if ((i & bit) !== 0) continue;
    const j = i | bit;

    const ar = real[i];
    const ai = imag[i];
    const br = real[j];
    const bi = imag[j];

    real[i] = inv * (ar + br);
    imag[i] = inv * (ai + bi);
    real[j] = inv * (ar - br);
    imag[j] = inv * (ai - bi);
  }
}

export function applyXRotationAll(state: StateVector, angle: number): void {
  for (let qubit = 0; qubit < state.numQubits; qubit++) {
    applyXRotation(state, qubit, angle);
  }
}

function applyXRotation(
  state: StateVector,
  qubit: number,
  angle: number,
): void {
  const { real, imag, size } = state;
  const bit = 1 << qubit;
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  for (let i = 0; i < size; i++) {
    if ((i & bit) !== 0) continue;
    const j = i | bit;

    const ar = real[i];
    const ai = imag[i];
    const br = real[j];
    const bi = imag[j];

    // Rx(2β) = [[cos β, -i sin β], [-i sin β, cos β]]
    real[i] = c * ar + s * bi;
    imag[i] = c * ai - s * br;
    real[j] = c * br + s * ai;
    imag[j] = c * bi - s * ar;
  }
}

export function applyPhaseDiagonal(
  state: StateVector,
  phases: Readonly<Float64Array>,
): void {
  const { real, imag, size } = state;
  if (phases.length !== size) {
    throw new Error(
      `phases length ${phases.length} does not match state size ${size}`,
    );
  }
  for (let i = 0; i < size; i++) {
    const phi = phases[i];
    if (phi === 0) continue;
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    const ar = real[i];
    const ai = imag[i];
    // multiply by exp(-i phi) = cos(phi) - i sin(phi)
    real[i] = c * ar + s * ai;
    imag[i] = c * ai - s * ar;
  }
}
