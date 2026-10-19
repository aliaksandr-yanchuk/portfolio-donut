"use client";

import { useEffect, useState } from "react";

type CopyStatus = "idle" | "copied" | "failed";

type CopyButtonProps = {
  /** クリップボードにコピーする文字列 */
  value: string;
  /** 読み上げ用のボタン名(例: 金額をコピー) */
  label: string;
  className?: string;
};

// コピー完了・失敗の表示を元に戻すまでの時間
const RESET_AFTER_MS = 1500;

const statusColor: Record<CopyStatus, string> = {
  idle: "text-muted hover:text-foreground",
  copied: "text-gain-positive",
  failed: "text-gain-negative",
};

/**
 * 値をクリップボードにコピーするアイコンボタン。
 * コピーできたらアイコンがチェックに変わり、結果を読み上げる。
 */
export function CopyButton({ value, label, className = "" }: CopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), RESET_AFTER_MS);
    return () => clearTimeout(timer);
  }, [status]);

  async function copy() {
    try {
      // HTTPS(または localhost)以外では navigator.clipboard 自体がないため、失敗として扱う。
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  const message =
    status === "copied" ? "コピーしました" : status === "failed" ? "コピーできませんでした" : "";

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={label}
        title={message || label}
        data-copy-status={status}
        className={[
          "hover:bg-surface-muted inline-flex size-8 items-center justify-center rounded-full",
          "focus-visible:outline-accent transition-colors focus-visible:outline-2",
          // 文字色のクラスは1つだけにする(同時に付けると CSS の出力順で決まり、意図した色にならない)。
          statusColor[status],
          className,
        ].join(" ")}
      >
        {status === "copied" ? <CheckIcon /> : <CopyIcon />}
      </button>
      {/* 結果をスクリーンリーダーに伝える(画面には表示しない)。 */}
      <span role="status" className="sr-only">
        {message}
      </span>
    </>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
