import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const DISMISSED_KEY = 'pwa_install_dismissed';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    ('standalone' in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

// ----------------------------------------------------------------------

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed or user dismissed before
    if (isInStandaloneMode() || sessionStorage.getItem(DISMISSED_KEY)) {
      return undefined;
    }

    let t: any;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    if (isIos()) {
      // Delay slightly so page renders first
      t = setTimeout(() => setShowIosGuide(true), 3000);
    } else {
      window.addEventListener('beforeinstallprompt', handler);
    }

    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setShowIosGuide(false);
    sessionStorage.setItem(DISMISSED_KEY, '1');
  };

  // ── Android / Chrome / Edge banner ──────────────────────────────────
  if (visible && deferredPrompt) {
    return (
      <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: 'calc(100% - 32px)', sm: 420 },
            zIndex: 9999,
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Accent bar */}
          <Box sx={{ height: 4, background: 'linear-gradient(90deg, #22C55E, #16A34A)' }} />

          <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2 }}>
            <Box
              component="img"
              src="/assets/icons/pwa/icon-192x192.png"
              alt="ShopMaster"
              sx={{ width: 48, height: 48, borderRadius: 2, flexShrink: 0 }}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                Install ShopMaster
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add to your home screen for the best experience
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
              <Button
                size="small"
                variant="contained"
                onClick={handleInstall}
                sx={{
                  background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 2,
                  '&:hover': { background: 'linear-gradient(135deg, #16A34A, #15803D)' },
                }}
              >
                Install
              </Button>
              <IconButton size="small" onClick={handleDismiss}>
                <Iconify icon="eva:close-fill" width={18} />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>
      </Slide>
    );
  }

  // ── iOS / Safari guide ───────────────────────────────────────────────
  if (showIosGuide) {
    return (
      <Slide direction="up" in={showIosGuide} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: 'calc(100% - 32px)', sm: 420 },
            zIndex: 9999,
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ height: 4, background: 'linear-gradient(90deg, #22C55E, #16A34A)' }} />

          <Stack spacing={1.5} sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  component="img"
                  src="/assets/icons/pwa/icon-192x192.png"
                  alt="ShopMaster"
                  sx={{ width: 40, height: 40, borderRadius: 1.5 }}
                />
                <Typography variant="subtitle2" fontWeight={700}>
                  Install ShopMaster
                </Typography>
              </Stack>
              <IconButton size="small" onClick={handleDismiss}>
                <Iconify icon="eva:close-fill" width={18} />
              </IconButton>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              To install this app on your iPhone:
            </Typography>

            <Stack spacing={1}>
              {([
                { icon: 'solar:share-bold', text: 'Tap the Share button in Safari' },
                { icon: 'solar:plus-circle-bold', text: 'Select "Add to Home Screen"' },
                { icon: 'solar:check-circle-bold', text: 'Tap "Add" to confirm' },
              ] as const).map((step) => (
                <Stack key={step.text} direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'success.lighter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={step.icon} width={16} color="success.dark" />
                  </Box>
                  <Typography variant="caption">{step.text}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Slide>
    );
  }

  return null;
}
