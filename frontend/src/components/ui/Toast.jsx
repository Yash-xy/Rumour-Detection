import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../../lib/cn";

const ToastContext = createContext(null);

const icons = {
  success: <CheckCircle size={18} className="text-success-400 flex-shrink-0" />,
  error: <AlertTriangle size={18} className="text-danger-400 flex-shrink-0" />,
  info: <Info size={18} className="text-primary-400 flex-shrink-0" />,
};

const styles = {
  success: "border-success-500/20 bg-success-500/10",
  error: "border-danger-500/20 bg-danger-500/10",
  info: "border-primary-500/20 bg-primary-500/10",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-xl border px-4 py-3 shadow-2xl shadow-black/30 flex items-start gap-3",
              "backdrop-blur-xl",
              styles[toast.type] || styles.info,
              toast.exiting ? "animate-toast-out" : "animate-toast-in"
            )}
          >
            {icons[toast.type] || icons.info}
            <p className="text-sm text-[var(--text)] flex-1 leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors cursor-pointer flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};
