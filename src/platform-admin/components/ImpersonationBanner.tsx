import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useAuth } from 'src/contexts/auth-context';

import { loadImpersonationMeta } from '../impersonation';

export function ImpersonationBanner() {
  const { isImpersonating, exitImpersonation, appData } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const meta = loadImpersonationMeta();

  if (!isImpersonating && !meta) {
    return null;
  }

  const businessName = meta?.businessName || appData?.businessName || 'tenant';
  const ownerName = meta?.ownerName || appData?.role || 'owner';

  const handleExit = async () => {
    setBusy(true);
    try {
      await exitImpersonation();
      navigate('/admin/businesses');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Alert
      severity="warning"
      variant="filled"
      sx={{ borderRadius: 0, py: 0.75 }}
      action={
        <Button color="inherit" size="small" disabled={busy} onClick={handleExit}>
          Exit
        </Button>
      }
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5} alignItems={{ sm: 'center' }}>
        <Typography variant="subtitle2">
          Impersonating {businessName}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Viewing as {ownerName}. Changes are audited. Exit to return to Platform Admin.
        </Typography>
      </Stack>
    </Alert>
  );
}
