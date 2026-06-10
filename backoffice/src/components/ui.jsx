function Button({ children, className = '', tone = 'primary', ...props }) {
  const tones = {
    primary: 'border-black bg-black text-white',
    soft: 'border-neutral-200 bg-white text-neutral-950',
    danger: 'border-neutral-200 bg-white text-red-600',
    icon: 'border-transparent bg-transparent text-neutral-950 hover:border-neutral-200 hover:bg-neutral-50',
  };

  return (
    <button
      type="button"
      className={`inline-flex min-h-[38px] items-center justify-center gap-2 rounded border px-3.5 font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Notice({ children, tone = 'success' }) {
  const tones = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <div className={`mb-3 flex min-h-[38px] items-center rounded border px-3 py-2 font-extrabold ${tones[tone]}`}>
      {children}
    </div>
  );
}

function Field({ children, label, className = '' }) {
  return (
    <label className={`relative grid gap-1.5 text-[13px] font-extrabold text-neutral-950 ${className}`}>
      {label}
      {children}
    </label>
  );
}

function StatusPill({ status, children }) {
  const tones = {
    published: 'bg-emerald-50 text-emerald-700',
    protected: 'bg-blue-50 text-blue-700',
    draft: 'bg-amber-50 text-amber-700',
  };

  return <span className={`${pillBase} ${tones[status] || tones.draft}`}>{children}</span>;
}

export { Button, Field, Notice, StatusPill };
import { pillBase } from '../utils/styleClasses';
