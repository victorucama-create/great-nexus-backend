// frontend/src/components/Toast.jsx
import React from "react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const { id, type, title, message } = toast;

  const color = type === "success" ? "bg-green-50 border-green-400" :
                type === "error" ? "bg-red-50 border-red-400" :
                "bg-blue-50 border-blue-400";

  return (
    <div
      className={`max-w-sm w-full ${color} border-l-4 p-4 rounded shadow-md mb-3`}
      role="status"
      aria-live="polite"
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-semibold text-gray-800">{title}</div>
          <div className="text-sm text-gray-700 mt-1">{message}</div>
        </div>
        <button aria-label="Fechar" onClick={() => onClose(id)} className="text-gray-500">✕</button>
      </div>
    </div>
  );
}
