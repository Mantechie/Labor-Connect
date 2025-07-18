import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Bootstrap Toast */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 2000 }}
      >
        <div
          className={`toast align-items-center text-bg-${toast.type} border-0 ${toast.show ? 'show' : ''}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">
              {toast.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Close"
              onClick={() => setToast((t) => ({ ...t, show: false }))}
            ></button>
          </div>
        </div>
      </div>
    </ToastContext.Provider>
  );
}; 