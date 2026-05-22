// Promise-based wrapper around MSG91 window-exposed methods

const WIDGET_ID = import.meta.env.VITE_MSG91_WIDGET_ID;
const TOKEN_AUTH = import.meta.env.VITE_MSG91_TOKEN_AUTH;

declare global {
  interface Window {
    initSendOTP: (config: {
      widgetId: string;
      tokenAuth: string;
      exposeMethods: boolean;
      success: (data: unknown) => void;
      failure: (data: unknown) => void;
    }) => void;
    sendOtp: (phone: string, success: (data: unknown) => void, failure: (err: unknown) => void) => void;
    verifyOtp: (otp: string, success: (data: { message: string }) => void, failure: (err: unknown) => void) => void;
    retryOtp: (channel: string | null, success: (data: unknown) => void, failure: (err: unknown) => void) => void;
  }
}

let initialized = false;

export async function initMsg91(): Promise<void> {
  if (initialized) return;
  if (!WIDGET_ID || !TOKEN_AUTH) throw new Error('MSG91 env vars missing');

  // Wait up to 5s for script to load
  for (let i = 0; i < 50; i++) {
    if (typeof window.initSendOTP === 'function') break;
    await new Promise(r => setTimeout(r, 100));
  }

  if (typeof window.initSendOTP !== 'function') throw new Error('MSG91 script not loaded');

  window.initSendOTP({
    widgetId: WIDGET_ID,
    tokenAuth: TOKEN_AUTH,
    exposeMethods: true,
    success: () => {},
    failure: () => {},
  });

  initialized = true;
}

export function sendOtp(phone: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.sendOtp !== 'function') return reject(new Error('MSG91 not initialized'));
    window.sendOtp(phone, () => resolve(), (err) => reject(err));
  });
}

export function verifyOtp(otp: string): Promise<{ message: string }> {
  return new Promise((resolve, reject) => {
    if (typeof window.verifyOtp !== 'function') return reject(new Error('MSG91 not initialized'));
    window.verifyOtp(otp, (data) => resolve(data), (err) => reject(err));
  });
}

export function retryOtp(channel: string | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.retryOtp !== 'function') return reject(new Error('MSG91 not initialized'));
    window.retryOtp(channel, () => resolve(), (err) => reject(err));
  });
}
