import { useContext, createContext, useState } from "react";
import ToastManager from "../components/ui/ToastManager";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider
      value={{
        showSuccess: (msg) => show(msg, "success"),
        showError: (msg) => show(msg, "error")
      }}
    >
      {children}
      <ToastManager toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
