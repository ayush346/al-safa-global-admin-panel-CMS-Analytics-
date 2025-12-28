import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const EditModeContext = createContext({
  isEditMode: false,
  setEditMode: () => {},
  visibilityMode: false,
  toggleVisibilityMode: () => {},
  isDisabled: () => false,
  disableContent: () => {},
  enableContent: () => {},
});

export function EditModeProvider({ children }) {
  const [isEditMode, setEditMode] = useState(false);
  const [visibilityMode, setVisibilityMode] = useState(false);
  const [disabledKeys, setDisabledKeys] = useState(() => new Set());

  const toggleVisibilityMode = useCallback(() => setVisibilityMode((v) => !v), []);

  const isDisabled = useCallback((key) => disabledKeys.has(key), [disabledKeys]);
  const disableContent = useCallback((key) => {
    setDisabledKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, [setDisabledKeys]);
  const enableContent = useCallback((key) => {
    setDisabledKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, [setDisabledKeys]);

  const contextValue = useMemo(
    () => ({
      isEditMode,
      setEditMode,
      visibilityMode,
      toggleVisibilityMode,
      isDisabled,
      disableContent,
      enableContent,
    }),
    [isEditMode, visibilityMode, isDisabled, disableContent, enableContent, toggleVisibilityMode]
  );

  return (
    <EditModeContext.Provider value={contextValue}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}




