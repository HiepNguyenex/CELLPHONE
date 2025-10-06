import React, {
  createContext, useContext, useMemo, useRef, useState, useCallback, useEffect,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Ctx = createContext(null);

const TYPE_STYLE = {
  info:    { dot: "bg-blue-500",    fallbackTitle: "Thông báo" },
  success: { dot: "bg-emerald-500", fallbackTitle: "Thành công" },
  error:   { dot: "bg-rose-500",    fallbackTitle: "Lỗi" },
  warning: { dot: "bg-amber-500",   fallbackTitle: "Cảnh báo" },
  loading: { dot: "bg-gray-400",    fallbackTitle: "Vui lòng chờ" },
};

function ToastItem({ id, type="info", title, description, action, onClose }) {
  const t = TYPE_STYLE[type] || TYPE_STYLE.info;
  return (
    <div className="w-80 bg-white border rounded-xl shadow-lg p-3 flex gap-3 items-start">
      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${t.dot} ${type==='loading' ? 'animate-pulse':''}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900">
          {title || t.fallbackTitle}
        </div>
        {description ? (
          <div className="text-xs text-gray-600 mt-0.5 break-words">{description}</div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {action?.label && typeof action.onClick === "function" && (
          <button
            className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
        <button
          className="text-gray-400 hover:text-gray-700 rounded px-1 leading-none"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16}/>
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const timers = useRef(new Map());

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const tm = timers.current.get(id);
    if (tm) { clearTimeout(tm); timers.current.delete(id); }
  }, []);

  const schedule = useCallback((id, duration) => {
    const tm = timers.current.get(id);
    if (tm) clearTimeout(tm);
    const t = setTimeout(() => dismiss(id), duration ?? 3500);
    timers.current.set(id, t);
  }, [dismiss]);

  const show = useCallback((opts = {}) => {
    const id = ++idRef.current;
    const rec = { id, ...opts };
    setToasts((prev) => [...prev, rec]);
    if (opts.type !== "loading") schedule(id, opts.duration);
    return id;
  }, [schedule]);

  const update = useCallback((id, patch = {}) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const finalType = patch.type ?? toasts.find((t) => t.id === id)?.type;
    if (finalType && finalType !== "loading") schedule(id, patch.duration);
    else {
      const tm = timers.current.get(id);
      if (tm) { clearTimeout(tm); timers.current.delete(id); }
    }
  }, [schedule, toasts]);

  const api = useMemo(() => ({
    show, update, dismiss,
    loading: (description="Đang xử lý…", opts={}) =>
      show({ type: "loading", description, ...opts }),
    success: (description, opts={}) =>
      show({ type: "success", description, ...opts }),
    error: (description, opts={}) =>
      show({ type: "error", description, ...opts }),
    warning: (description, opts={}) =>
      show({ type: "warning", description, ...opts }),
    info: (description, opts={}) =>
      show({ type: "info", description, ...opts }),
  }), [show, update, dismiss]);

  const portal = createPortal(
    <div className="fixed z-[9999] top-4 right-4 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onClose={() => dismiss(t.id)} />
      ))}
    </div>,
    document.body
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      {portal}
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}

export default useToast;
