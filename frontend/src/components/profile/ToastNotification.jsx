import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastNotification({ toast = null, onClose }) {
  if (!toast) return null;

  const typeStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-500/20',
    error: 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-500/20',
    warning: 'bg-amber-950/90 border-amber-500/50 text-amber-200 shadow-amber-500/20',
    info: 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200 shadow-cyan-500/20',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border backdrop-blur-2xl shadow-2xl flex items-center space-x-3 max-w-md ${
          typeStyles[toast.type] || typeStyles.info
        }`}
      >
        <div className="flex-shrink-0">{icons[toast.type] || icons.info}</div>
        <div className="flex-1 text-xs">
          {toast.title && <div className="font-bold text-white mb-0.5">{toast.title}</div>}
          <div className="font-medium opacity-90">{toast.message}</div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
