import { useMemo, useState, useContext, useCallback, createContext } from 'react';

import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// ----------------------------------------------------------------------

type Severity = 'success' | 'error' | 'info' | 'warning';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: Severity;
}

interface SnackbarContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

// ----------------------------------------------------------------------

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const show = useCallback((message: string, severity: Severity) => {
    setState({ open: true, message, severity });
  }, []);

  const handleClose = useCallback((_: any, reason?: string) => {
    if (reason === 'clickaway') return;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(
    () => ({
      showSuccess: (msg: string) => show(msg, 'success'),
      showError: (msg: string) => show(msg, 'error'),
      showInfo: (msg: string) => show(msg, 'info'),
      showWarning: (msg: string) => show(msg, 'warning'),
    }),
    [show]
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={handleClose}
          severity={state.severity}
          variant="filled"
          sx={{ width: '100%', maxWidth: 420 }}
        >
          {state.message}
        </MuiAlert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

// ----------------------------------------------------------------------

export function useAppSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useAppSnackbar must be used within SnackbarProvider');
  return ctx;
}
