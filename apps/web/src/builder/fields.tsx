import { ReactNode } from 'react';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-tg-hint">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-tg-hint/70">{hint}</span>}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2 text-sm text-tg-text placeholder:text-tg-hint/60 focus:border-tg-link/40 focus:outline-none"
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2 text-sm text-tg-text placeholder:text-tg-hint/60 focus:border-tg-link/40 focus:outline-none"
    />
  );
}

/** Segmented control for small enums. */
export function Choice<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
            value === o.value
              ? 'bg-tg-button text-tg-button-text'
              : 'border border-white/[0.1] text-tg-hint hover:bg-white/5 hover:text-tg-text'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Editor for repeating sub-items: links, features, FAQ entries. */
export function RepeatList<T>({
  items,
  onChange,
  blank,
  max,
  addLabel,
  render,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  blank: T;
  max: number;
  addLabel: string;
  render: (item: T, set: (patch: Partial<T>) => void) => ReactNode;
}) {
  const setAt = (i: number, patch: Partial<T>) =>
    onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5">
          <div className="space-y-1.5">{render(item, (patch) => setAt(i, patch))}</div>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            disabled={items.length <= 1}
            className="mt-1.5 text-[11px] text-tg-hint transition-colors hover:text-red-400 disabled:opacity-30 disabled:hover:text-tg-hint"
          >
            Remove
          </button>
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, { ...blank }])}
          className="w-full rounded-xl border border-dashed border-white/[0.14] py-2 text-xs font-medium text-tg-link transition-colors hover:border-tg-link/40 hover:bg-white/[0.03]"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}
