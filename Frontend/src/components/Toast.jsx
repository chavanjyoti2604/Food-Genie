import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-alert toast-${toast.type}`}
        >
          <div style={styles.content}>
            {toast.type === 'success' && <CheckCircle size={18} className="text-success" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-danger" />}
            {toast.type === 'info' && <Info size={18} className="text-gradient" />}
            <span>{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '14px',
    fontWeight: '550',
  },
};

export default Toast;
