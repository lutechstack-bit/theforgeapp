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
