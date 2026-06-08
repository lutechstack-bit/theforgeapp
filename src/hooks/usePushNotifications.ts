import { useCallback, useEffect, useState } from 'react';
import { pushSupported, pushPermission, isSubscribed, subscribeToPush, unsubscribeFromPush } from '@/lib/push';

export function usePushNotifications() {
  const [supported] = useState(pushSupported());
  const [permission, setPermission] = useState<NotificationPermission>(pushPermission());
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setPermission(pushPermission());
    setSubscribed(await isSubscribed());
  }, []);

  useEffect(() => {
    if (supported) refresh();
  }, [supported, refresh]);

  const enable = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await subscribeToPush();
    if (!res.ok) setError(res.error || 'Could not enable notifications.');
    await refresh();
    setLoading(false);
    return res.ok;
  }, [refresh]);

  const disable = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await unsubscribeFromPush();
    if (!res.ok) setError(res.error || 'Could not disable notifications.');
    await refresh();
    setLoading(false);
    return res.ok;
  }, [refresh]);

  return { supported, permission, subscribed, loading, error, enable, disable, refresh };
}
