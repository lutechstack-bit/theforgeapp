/**
 * Async unwrap for Supabase Functions errors. The SDK wraps non-2xx
 * responses in a FunctionsHttpError with a generic .message ("Edge
 * function returned a non-2xx status code"); the actual server JSON
 * lives in error.context, which is a Response object that needs to be
 * .json()'d. Falls back to errMessage() if no context exists.
 *
 * Use at edge-function call sites:
 *   if (response.error) throw new Error(await unwrapEdgeError(response.error));
 */
export const unwrapEdgeError = async (e: unknown): Promise<string> => {
  if (!e) return 'Unknown error';
  // Try to read the embedded Response body, where the function's JSON lives.
  const ctx = (e as { context?: unknown }).context;
  if (ctx && typeof ctx === 'object') {
    const r = ctx as { json?: () => Promise<unknown>; text?: () => Promise<string> };
    try {
      if (typeof r.json === 'function') {
        const body = (await r.json()) as { error?: unknown; message?: unknown } | null;
        if (body && typeof body === 'object') {
          if (typeof body.error === 'string' && body.error) return body.error;
          if (typeof body.message === 'string' && body.message) return body.message;
        }
      } else if (typeof r.text === 'function') {
        const text = await r.text();
        if (text) {
          try {
            const parsed = JSON.parse(text) as { error?: unknown; message?: unknown };
            if (typeof parsed.error === 'string' && parsed.error) return parsed.error;
            if (typeof parsed.message === 'string' && parsed.message) return parsed.message;
          } catch {
            return text;
          }
        }
      }
    } catch {
      // Fall through to generic stringification.
    }
  }
  return errMessage(e);
};

/**
 * Pull a human-readable message out of any error shape we throw or catch.
 *
 * Why: throwing a Supabase PostgrestError (or any plain object with a
 * `message` field) and toasting `String(e)` yields "[object Object]" which
 * is useless. This util prefers `.message`, falls back to JSON, then to
 * `String(e)`. Use everywhere we toast a caught error.
 */
export const errMessage = (e: unknown): string => {
  if (!e) return 'Unknown error';
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  if (typeof e === 'object') {
    const obj = e as {
      message?: unknown;
      hint?: unknown;
      details?: unknown;
      code?: unknown;
    };
    if (typeof obj.message === 'string' && obj.message) {
      let msg = obj.message;
      if (typeof obj.hint === 'string' && obj.hint) msg += ` — ${obj.hint}`;
      else if (typeof obj.details === 'string' && obj.details) msg += ` — ${obj.details}`;
      if (typeof obj.code === 'string' && obj.code) msg += ` [${obj.code}]`;
      return msg;
    }
    try {
      return JSON.stringify(e);
    } catch {
      return '[unknown error]';
    }
  }
  return String(e);
};
