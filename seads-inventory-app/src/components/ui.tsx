import { useEffect, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { X, LoaderCircle } from 'lucide-react';

// ── ボタン ──

type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const btnBase =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium cursor-pointer ' +
  'transition-all duration-200 active:scale-95 touch-manipulation select-none ' +
  'disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100 ' +
  'min-h-11 px-4 text-sm';

const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark hover:shadow-md',
  secondary: 'bg-sub text-primary border border-slate-300 hover:brightness-95',
  danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
  ghost: 'bg-transparent text-primary hover:bg-sub',
};

export interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  busy?: boolean;
}

export function Btn({ variant = 'primary', busy, disabled, children, className = '', ...rest }: BtnProps) {
  return (
    <button
      type="button"
      className={`${btnBase} ${btnVariants[variant]} ${className}`}
      disabled={disabled || busy}
      {...rest}
    >
      {busy && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

// ── バッジ ──

type BadgeTone = 'alert' | 'ok' | 'info' | 'past' | 'upcoming';

const badgeTones: Record<BadgeTone, string> = {
  alert: 'bg-accent-dark text-white',
  ok: 'bg-green-100 text-green-800',
  info: 'bg-sub text-primary',
  past: 'bg-slate-200 text-slate-600',
  upcoming: 'bg-sub text-primary',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap tabular-nums ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

// ── 充足ゲージ ──

export function Gauge({ pct, mini = false }: { pct: number; mini?: boolean }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-slate-200 ${mini ? 'h-1.5 max-w-40' : 'h-2'}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          clamped >= 100
            ? 'bg-gradient-to-r from-green-500 to-green-400'
            : 'bg-gradient-to-r from-accent to-orange-400'
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

// ── 空状態 ──

export function EmptyState({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="py-10 text-center text-slate-600">
      <div className="bob mx-auto mb-3.5 flex h-21 w-21 items-center justify-center rounded-full bg-sub text-primary">
        {icon}
      </div>
      <p className="text-sm leading-7">{children}</p>
    </div>
  );
}

// ── モーダル ──

export function Modal({
  title,
  icon,
  onClose,
  children,
}: {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal-pop max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-primary">
            {icon}
            {title}
          </h2>
          <Btn variant="ghost" className="min-w-11 !px-0" onClick={onClose} aria-label="閉じる">
            <X size={20} aria-hidden />
          </Btn>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── フォームフィールド ──

export function Field({
  id,
  label,
  required = false,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-slate-600">
        {label}
        {required && (
          <span className="ml-0.5 text-red-600" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputCls =
  'w-full min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base ' +
  'text-slate-900 outline-none transition-colors focus:border-primary ' +
  'aria-[invalid=true]:border-red-500';
