// frontend/src/hooks/useToast.js
import { useState, useCallback } from "react";

let idCounter = 1;

export default function useToastProvider() {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((t) => {
    const id = idCounter++;
    const toast = { id, ...t };
    setToasts((s) => [toast, ...s]);

    // auto remove after 6s
    setTimeout(() => {
      setToasts((s) => s.filter(x => x.id !== id));
    }, (t.ttl || 6000));
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((s) => s.filter(t => t.id !== id));
  }, []);

  return { toasts, pushToast, removeToast };
}
