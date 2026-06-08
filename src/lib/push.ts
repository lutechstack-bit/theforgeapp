import { supabase } from '@/integrations/supabase/client';

export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export const pushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bufToB64Url(buf: ArrayBuffer | null): string {
  if (!buf) return '';
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.ready;
  return reg;
}

/** Current browser permission state. */
export const pushPermission = (): NotificationPermission =>
  pushSupported() ? Notification.permission : 'denied';

/** Is this device already subscribed (in the browser)? */
export async function isSubscribed(): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const reg = await getRegistration();
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

/** Ask permission, subscribe, and persist to push_subscriptions. Returns true on success. */
export async function subscribeToPush(): Promise<{ ok: boolean; error?: string }> {
  if (!pushSupported()) return { ok: false, error: 'Push is not supported on this browser.' };
  if (!VAPID_PUBLIC_KEY) return { ok: false, error: 'VAPID public key is not configured.' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, error: 'Notification permission was not granted.' };

  const reg = await getRegistration();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const json = sub.toJSON();
  const p256dh = json.keys?.p256dh || bufToB64Url(sub.getKey('p256dh'));
  const auth = json.keys?.auth || bufToB64Url(sub.getKey('auth'));

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return { ok: false, error: 'You must be signed in to enable notifications.' };

  const { error } = await (supabase as any)
    .from('push_subscriptions')
    .upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh,
        auth,
        user_agent: navigator.userAgent,
        enabled: true,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' }
    );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Unsubscribe this device and disable the row. */
export async function unsubscribeFromPush(): Promise<{ ok: boolean; error?: string }> {
  if (!pushSupported()) return { ok: false };
  try {
    const reg = await getRegistration();
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await (supabase as any).from('push_subscriptions').update({ enabled: false }).eq('endpoint', sub.endpoint);
      await sub.unsubscribe();
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message };
  }
}
