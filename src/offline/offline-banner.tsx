import { useOffline } from './offline-context';

/**
 * Compact connectivity / sync indicator for the dashboard shell.
 */
export function OfflineBanner() {
  const { status, syncNow } = useOffline();

  if (status.online && status.pendingOps === 0 && !status.lastError) {
    return null;
  }

  const bg = !status.online ? '#B45309' : status.lastError ? '#B91C1C' : '#1D4ED8';
  const label = !status.online
    ? `Offline mode — ${status.pendingOps} change${status.pendingOps === 1 ? '' : 's'} queued (sales sync when back online)`
    : status.syncing
      ? 'Syncing pending sales & changes…'
      : status.lastError
        ? `Sync error: ${status.lastError} — tap to retry`
        : `${status.pendingOps} pending — tap to sync now`;

  return (
    <button
      type="button"
      onClick={() => {
        if (status.online) void syncNow();
      }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1400,
        width: '100%',
        border: 'none',
        cursor: status.online ? 'pointer' : 'default',
        background: bg,
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        padding: '8px 16px',
        textAlign: 'center',
      }}
    >
      {label}
    </button>
  );
}
