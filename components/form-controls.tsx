"use client";

import { useId } from "react";

export function RequiredLabel({ label, required = true }: { label: string; required?: boolean }) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="min-w-0 break-words">{label}</span>
      <span className={required ? "rounded-full bg-chili/[0.14] px-2 py-0.5 text-[11px] text-chili" : "rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-ink-500"}>
        {required ? "必填" : "选填"}
      </span>
    </span>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "decimal" | "url";
};

export function TextInput({ label, value, onChange, required = true, hint, placeholder, inputMode = "text" }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <label className="grid min-w-0 gap-1 text-sm text-ink-300" htmlFor={id}>
      <RequiredLabel label={label} required={required} />
      <input aria-describedby={hintId} className="control" id={id} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {hint ? <span className="break-words text-xs leading-5 text-ink-500" id={hintId}>{hint}</span> : null}
    </label>
  );
}

export function TextArea({ label, value, onChange, required = true, hint, placeholder }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <label className="grid min-w-0 gap-1 text-sm text-ink-300" htmlFor={id}>
      <RequiredLabel label={label} required={required} />
      <textarea aria-describedby={hintId} className="control min-h-24 resize-y" id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {hint ? <span className="break-words text-xs leading-5 text-ink-500" id={hintId}>{hint}</span> : null}
    </label>
  );
}
