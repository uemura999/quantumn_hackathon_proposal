import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function POST(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'qiskit_backend_not_implemented',
      message:
        'Qiskit 連携は Phase 5 で実装予定です。今は JS エンジン (src/engine) のみを使ってください。',
    },
    { status: 501 },
  );
}
