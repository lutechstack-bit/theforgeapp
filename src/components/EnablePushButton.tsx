import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

export function EnablePushButton({ compact = false }: { compact?: boolean }) {
  const { supported, permission, subscribed, loading, error, enable, disable } = usePushNotifications();

  if (!supported) {
    return <p className="text-xs text-muted-foreground">Push notifications aren’t supported on this browser.</p>;
  }

  const onEnable = async () => {
    const ok = await enable();
    if (ok) toast.success('Notifications enabled on this device.');
    else toast.error(error || 'Could not enable notifications.');
  };
  const onDisable = async () => {
    await disable();
    toast.info('Notifications disabled on this device.');
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm text-emerald-400"><BellRing className="h-4 w-4" /> Enabled on this device</span>
        {!compact && (
          <Button size="sm" variant="ghost" onClick={onDisable} disabled={loading} className="text-muted-foreground">
            <BellOff className="mr-1.5 h-3.5 w-3.5" /> Turn off
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Button size="sm" onClick={onEnable} disabled={loading || permission === 'denied'}>
        <Bell className="mr-1.5 h-4 w-4" /> {loading ? 'Enabling…' : 'Enable push on this device'}
      </Button>
      {permission === 'denied' && (
        <p className="text-xs text-amber-400">Notifications are blocked in your browser settings — unblock them for this site, then retry.</p>
      )}
    </div>
  );
}

export default EnablePushButton;
