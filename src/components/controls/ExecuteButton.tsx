'use client';

import { Button } from '@/components/ui/Button';

interface ExecuteButtonProps {
  readonly onExecute: () => void;
  readonly disabled: boolean;
  readonly running: boolean;
}

export function ExecuteButton({
  onExecute,
  disabled,
  running,
}: ExecuteButtonProps) {
  return (
    <Button
      onClick={onExecute}
      disabled={disabled || running}
      className="w-full mt-2"
    >
      {running ? '量子計算中…' : '量子で実行 →'}
    </Button>
  );
}
