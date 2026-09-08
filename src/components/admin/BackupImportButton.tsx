"use client";

import { useRef, useTransition } from "react";

// Dosya seçtirip bir server action'a POST eden "İçe Aktar" butonu.
export default function BackupImportButton({
  action,
  accept,
  label = "İçe Aktar",
  confirmMessage,
  className = "",
}: {
  action: (formData: FormData) => void | Promise<void>;
  accept: string;
  label?: string;
  confirmMessage?: string;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form ref={formRef} action={action}>
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className={
          className ||
          "flex items-center gap-1.5 rounded-full bg-chip px-4 py-2 text-[13px] font-bold text-ink disabled:opacity-60"
        }
      >
        {pending ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-accent" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
        )}
        {pending ? "Yükleniyor…" : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept={accept}
        hidden
        onChange={(e) => {
          if (!e.target.files?.length) return;
          if (confirmMessage && !window.confirm(confirmMessage)) {
            e.target.value = "";
            return;
          }
          startTransition(() => formRef.current?.requestSubmit());
        }}
      />
    </form>
  );
}
