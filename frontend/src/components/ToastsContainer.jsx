// frontend/src/components/ToastsContainer.jsx
import React from "react";
import Toast from "./Toast";

export default function ToastsContainer({ toasts, removeToast }) {
  return (
    <div aria-live="polite" className="fixed top-6 right-6 z-50">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onClose={removeToast} />
      ))}
    </div>
  );
}
