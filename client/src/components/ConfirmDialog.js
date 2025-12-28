import React from 'react';

export function ConfirmDialog({ open, message, onConfirm, onCancel, title = 'Confirm Deletion' }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff',
          padding: '1rem 1.25rem',
          borderRadius: 8,
          width: 'min(420px, 92vw)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h4 style={{ margin: 0, marginBottom: 8 }}>{title}</h4>
        <p style={{ margin: 0 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-secondary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirmState() {
  const [confirmState, setConfirmState] = React.useState({
    open: false,
    message: '',
    onConfirm: null,
  });

  const askConfirm = React.useCallback((message, onConfirm) => {
    setConfirmState({ open: true, message, onConfirm });
  }, []);

  const handleConfirm = React.useCallback(() => {
    setConfirmState((prev) => {
      if (typeof prev.onConfirm === 'function') {
        try { prev.onConfirm(); } catch (e) { /* no-op */ }
      }
      return { open: false, message: '', onConfirm: null };
    });
  }, []);

  const handleCancel = React.useCallback(() => {
    setConfirmState({ open: false, message: '', onConfirm: null });
  }, []);

  return { confirmState, askConfirm, handleConfirm, handleCancel };
}






