import React from 'react';

export function FloatingGlassInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = ' ',
  disabled = false,
  icon: Icon,
  isMono = false,
  isTextArea = false,
  rows = 3,
}) {
  const id = `floating_${label.toLowerCase().replace(/\s+/g, '_')}`;

  return (
    <div className="relative group w-full">
      {isTextArea ? (
        <textarea
          id={id}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className="peer w-full px-4 pt-5 pb-2 bg-black/50 backdrop-blur-xl border border-white/15 rounded-2xl text-xs text-white placeholder-transparent focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 resize-none leading-relaxed"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`peer w-full px-4 pt-5 pb-2 bg-black/50 backdrop-blur-xl border border-white/15 rounded-2xl text-xs text-white placeholder-transparent focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 ${
            isMono ? 'font-mono' : ''
          } ${Icon ? 'pr-10' : ''}`}
        />
      )}

      {/* Floating Label */}
      <label
        htmlFor={id}
        className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-cyan-400"
      >
        {label}
      </label>

      {/* Icon */}
      {Icon && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
      )}

      {/* Ambient Glow Reflection on Focus */}
      <div className="absolute inset-0 rounded-2xl bg-cyan-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none -z-10 blur-sm" />
    </div>
  );
}
