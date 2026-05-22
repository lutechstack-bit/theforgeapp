import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import forgeLogo from '@/assets/forge-logo.png';
import forgeLogoLight from '@/assets/forge-logo-light.png';
import { initMsg91, sendOtp, verifyOtp, retryOtp } from '@/lib/msg91';
import { supabase } from '@/integrations/supabase/client';

/**
 * Auth (Login) — split-screen redesign.
 *
 * Visual layout ported from Shakthi's HTML prototype in
 * lovable/ui-login-page-revamp (commit 526444d). Desktop is 35/65
 * split with the form on the left and a background video on the
 * right; on mobile the video stacks above the form with a
 * fade-to-black handoff so the login pulls up into it.
 *
 * Every piece of auth logic from the previous implementation is
 * preserved unchanged: zod validation, Supabase signIn via the
 * useAuth context, toast error mapping, navigation to /welcome on
 * success. Only the JSX + styling changed.
 *
 * Phone OTP login added as a secondary flow (Step 2 of MSG91 integration).
 * Email/password remains the default and is unchanged.
 */

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type Mode = 'email' | 'phone-enter' | 'phone-otp';

const slideVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const Auth: React.FC = () => {
  // ── Email / password state ──────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // ── OTP flow state ──────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>('email');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendSec, setResendSec] = useState(0);

  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();

  // Safari on iOS sometimes ignores the autoPlay attribute on the first
  // render — especially when a service worker serves the mp4 from a
  // Range cache (our PWA runtime-cache does this). Manually calling
  // play() once the element is mounted catches those cases so users
  // don't see the big "tap to play" overlay. If the browser still
  // refuses (e.g. Low Power Mode is on — an OS-level block we can't
  // override) the promise rejects silently and the poster stays.
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      /* autoplay blocked (low power mode, reduce motion, etc.) — no-op */
    });
  }, []);

  // Initialize MSG91 on mount — catch silently if script not yet loaded
  useEffect(() => {
    initMsg91().catch(() => { /* silent — will retry when user clicks OTP */ });
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendSec <= 0) return;
    const id = setTimeout(() => setResendSec((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendSec]);

  // ── Email / password submit ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: typeof errors = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message === 'Invalid login credentials'
          ? 'The email or password you entered is incorrect.'
          : error.message,
        variant: 'destructive',
      });
      return;
    }

    navigate('/welcome');
  };

  // ── OTP: Send ───────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      toast({ title: 'Invalid number', description: 'Please enter a 10-digit mobile number.', variant: 'destructive' });
      return;
    }
    setOtpLoading(true);
    try {
      // Ensure MSG91 is initialized (in case mount-time attempt failed)
      await initMsg91();
      const normalized = `91${digits}`;
      await sendOtp(normalized);
      setMode('phone-otp');
      setResendSec(30);
    } catch (err: any) {
      toast({ title: 'Failed to send OTP', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setOtpLoading(false);
    }
  };

  // ── OTP: Verify ─────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 4) {
      toast({ title: 'Invalid OTP', description: 'Please enter the 4-digit OTP.', variant: 'destructive' });
      return;
    }
    setOtpLoading(true);
    try {
      const verifyResult = await verifyOtp(otp);
      // Log so we can see exactly what MSG91 widget returns
      console.log('[OTP] verifyResult:', JSON.stringify(verifyResult));
      const accessToken = (verifyResult as any).access_token ?? (verifyResult as any).token ?? verifyResult.message;
      console.log('[OTP] accessToken prefix:', String(accessToken).slice(0, 30));

      const digits = phone.replace(/\D/g, '');
      const normalized = digits.length === 10 ? `91${digits}` : digits;

      const { data, error } = await supabase.functions.invoke('verify-msg91-otp', {
        body: { accessToken, phone: normalized },
      });

      console.log('[OTP] function response:', { data, error });

      // Extract the real error message from the function response body
      let errMsg = 'Verification failed';
      if (error) {
        try {
          const ctx = (error as any).context;
          if (ctx) {
            const body = typeof ctx.json === 'function' ? await ctx.json() : null;
            errMsg = body?.error || error.message;
          } else {
            errMsg = error.message;
          }
        } catch { errMsg = error.message; }
      } else if (!data?.success) {
        errMsg = data?.error || 'Verification failed';
      }

      if (error || !data?.success) {
        throw new Error(errMsg);
      }

      // Sign in via magic link token_hash
      const { error: sessionErr } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: 'magiclink',
      });

      if (sessionErr) throw sessionErr;

      if (data.isNewUser) {
        navigate('/profile/setup');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast({ title: 'OTP verification failed', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setOtpLoading(false);
    }
  };

  // ── OTP: Resend ─────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendSec > 0) return;
    try {
      await retryOtp(null);
      setResendSec(30);
      toast({ title: 'OTP resent', description: 'A new OTP has been sent to your number.' });
    } catch (err: any) {
      toast({ title: 'Resend failed', description: err?.message || String(err), variant: 'destructive' });
    }
  };

  return (
    <main className="h-[100svh] lg:h-[100dvh] w-full grid grid-cols-1 lg:grid-cols-[35fr_65fr] bg-black text-foreground overflow-hidden">
      {/* ─────────────── Video pane (right on desktop, top on mobile) ─────────────── */}
      <section className="relative overflow-hidden bg-black order-1 lg:order-2 h-[42vh] lg:h-full">
        <video
          ref={videoRef}
          src="/login/Forge_website.mp4"
          poster="/login/Forge_website_poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          // iOS hides native controls by default on inline video,
          // but these extra disables stop AirPlay/PiP buttons from
          // appearing if the user long-presses.
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Desktop vignette: subtle horizontal edge-blend + radial darken */}
        <div
          aria-hidden
          className="hidden lg:block absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.85) 4%, rgba(0,0,0,0.45) 10%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 82%, rgba(10,10,10,0.25) 100%), radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* Mobile vignette: bottom fade-to-black so the form pulls up seamlessly */}
        <div
          aria-hidden
          className="lg:hidden absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.75) 82%, #000 95%, #000 100%)',
          }}
        />

        {/* Mobile-only Forge logo overlay on the video */}
        <div className="lg:hidden absolute top-5 left-5 z-[3] animate-fade-up">
          <div
            aria-hidden
            className="absolute -inset-x-4 -inset-y-3 -z-10 blur-[6px]"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(255,188,59,0.38) 0%, rgba(255,188,59,0) 65%)',
            }}
          />
          <img
            src={forgeLogoLight}
            alt=""
            className="w-[118px] h-auto drop-shadow-[0_4px_14px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Editorial tagline */}
        <p className="absolute z-[3] left-5 lg:left-11 right-5 lg:right-auto bottom-5 lg:bottom-10 lg:max-w-[720px] font-fraunces italic font-medium text-[20px] lg:text-[44px] leading-[1.2] lg:leading-[1.15] tracking-[-0.3px] lg:tracking-[-0.4px] max-w-[260px] lg:max-w-[720px] text-[#F5F1E8] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] animate-fade-up">
          Your journey from Dreamer to Doer starts here
        </p>
      </section>

      {/* ─────────────── Login pane (left on desktop, bottom on mobile) ─────────────── */}
      <section
        className="relative flex flex-col items-center justify-center bg-black px-5 py-3 lg:px-16 lg:py-10 order-2 lg:order-1 z-[4] lg:z-auto lg:h-full lg:overflow-hidden"
      >
        <div className="relative w-full max-w-[420px] flex flex-col items-center animate-fade-up">
          {/* Desktop logo with radial glow (hidden on mobile — replaced by overlay above) */}
          <div className="relative w-[220px] h-[88px] hidden lg:flex items-center justify-center mb-6">
            <div
              aria-hidden
              className="absolute -inset-x-10 -inset-y-5 blur-[6px] animate-pulse-soft"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(255,188,59,0.45) 0%, rgba(255,188,59,0) 65%)',
              }}
            />
            <img src={forgeLogo} alt="the Forge" className="relative w-full h-auto" />
          </div>

          <h1 className="text-[24px] lg:text-[30px] font-bold text-primary text-center leading-[1.15] tracking-[-0.4px]">
            Welcome Creator
          </h1>
          <p className="mt-1 mb-3 lg:mb-7 text-[13px] lg:text-[14px] text-muted-foreground text-center">
            Continue your creative journey
          </p>

          {/* ── Animated view switcher ───────────────────────────────────────── */}
          <div className="w-full">
            <AnimatePresence mode="wait" initial={false}>
              {/* ── EMAIL / PASSWORD VIEW ── */}
              {mode === 'email' && (
                <motion.div
                  key="email"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <form
                    onSubmit={handleSubmit}
                    className="w-full bg-[#141414] border border-primary/[0.08] rounded-[20px] p-4 lg:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_20px_50px_rgba(0,0,0,0.5)]"
                  >
                    {/* Email */}
                    <div className="mb-3 lg:mb-4">
                      <label
                        htmlFor="auth-email"
                        className="block text-[14px] font-semibold text-foreground mb-2"
                      >
                        Email
                      </label>
                      <input
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        className="w-full bg-[#1C1C1C] border border-primary/20 rounded-xl px-4 py-[13px] lg:py-[14px] text-[15px] text-foreground placeholder:text-primary/50 transition-colors focus:outline-none focus:border-primary/60 focus:bg-[#1F1F1F]"
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive mt-1.5 ml-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Password + Forgot link on same row */}
                    <div className="mb-3 lg:mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor="auth-password"
                          className="block text-[14px] font-semibold text-foreground"
                        >
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-[13px] font-medium text-primary/90 hover:text-primary hover:underline underline-offset-[3px] transition-opacity"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          id="auth-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                          required
                          className="w-full bg-[#1C1C1C] border border-primary/20 rounded-xl px-4 py-[13px] lg:py-[14px] pr-12 text-[15px] text-foreground placeholder:text-primary/40 transition-colors focus:outline-none focus:border-primary/60 focus:bg-[#1F1F1F]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-destructive mt-1.5 ml-1">{errors.password}</p>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-[14px] lg:py-[16px] mt-1 rounded-xl text-[#111] font-semibold text-[15px] lg:text-base tracking-[0.1px] bg-gradient-to-b from-[#F5C76A] via-primary to-[#D99A1F] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_25px_rgba(255,188,59,0.18),0_2px_6px_rgba(0,0,0,0.3)] hover:brightness-[1.04] hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_14px_32px_rgba(255,188,59,0.28),0_3px_8px_rgba(0,0,0,0.35)] active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {loading ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Entering…
                        </span>
                      ) : (
                        'Enter the Circle'
                      )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-primary/10" />
                      <span className="text-neutral-500 text-xs uppercase tracking-widest">or</span>
                      <div className="flex-1 h-px bg-primary/10" />
                    </div>

                    {/* OTP login button */}
                    <button
                      type="button"
                      onClick={() => setMode('phone-enter')}
                      className="w-full py-[13px] lg:py-[15px] rounded-xl font-semibold text-[15px] tracking-[0.1px] border border-[#E8B86D]/40 text-[#E8B86D] hover:bg-[#E8B86D]/10 bg-transparent transition-all"
                    >
                      Login with OTP
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── PHONE NUMBER ENTRY VIEW ── */}
              {mode === 'phone-enter' && (
                <motion.div
                  key="phone-enter"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-full bg-[#141414] border border-primary/[0.08] rounded-[20px] p-4 lg:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_20px_50px_rgba(0,0,0,0.5)]">
                    {/* Back link */}
                    <button
                      type="button"
                      onClick={() => setMode('email')}
                      className="text-[13px] text-primary/70 hover:text-primary transition-colors mb-4 flex items-center gap-1"
                    >
                      ← Back to email login
                    </button>

                    <h2 className="text-[18px] font-bold text-foreground mb-4">Login with OTP</h2>

                    {/* Phone input row */}
                    <div className="mb-4">
                      <label className="block text-[14px] font-semibold text-foreground mb-2">
                        Mobile Number
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-none flex items-center px-3 bg-[#1C1C1C] border border-primary/20 rounded-xl text-[15px] text-foreground/60 select-none">
                          +91
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 bg-[#1C1C1C] border border-primary/20 rounded-xl px-4 py-[13px] lg:py-[14px] text-[15px] text-foreground placeholder:text-primary/40 transition-colors focus:outline-none focus:border-primary/60 focus:bg-[#1F1F1F]"
                        />
                      </div>
                    </div>

                    {/* Send OTP button */}
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpLoading}
                      className="w-full py-[14px] lg:py-[16px] rounded-xl text-[#111] font-semibold text-[15px] tracking-[0.1px] bg-gradient-to-r from-[#E8B86D] to-[#C9963F] hover:opacity-90 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {otpLoading ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending…
                        </span>
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── OTP VERIFICATION VIEW ── */}
              {mode === 'phone-otp' && (
                <motion.div
                  key="phone-otp"
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-full bg-[#141414] border border-primary/[0.08] rounded-[20px] p-4 lg:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_20px_50px_rgba(0,0,0,0.5)]">
                    {/* Change number link */}
                    <button
                      type="button"
                      onClick={() => { setMode('phone-enter'); setOtp(''); }}
                      className="text-[13px] text-primary/70 hover:text-primary transition-colors mb-4 flex items-center gap-1"
                    >
                      ← Change number
                    </button>

                    <h2 className="text-[18px] font-bold text-foreground mb-1">Enter OTP</h2>
                    <p className="text-[13px] text-muted-foreground mb-4">
                      Sent to +91 {phone}
                    </p>

                    {/* OTP input */}
                    <div className="mb-4">
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="----"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-14 bg-[#1C1C1C] border border-primary/20 rounded-xl text-center text-2xl tracking-[0.5em] text-foreground placeholder:text-primary/20 transition-colors focus:outline-none focus:border-primary/60 focus:bg-[#1F1F1F]"
                      />
                    </div>

                    {/* Verify button */}
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading}
                      className="w-full py-[14px] lg:py-[16px] rounded-xl text-[#111] font-semibold text-[15px] tracking-[0.1px] bg-gradient-to-r from-[#E8B86D] to-[#C9963F] hover:opacity-90 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {otpLoading ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Verifying…
                        </span>
                      ) : (
                        'Verify & continue'
                      )}
                    </button>

                    {/* Resend */}
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendSec > 0}
                        className="text-[13px] text-[#E8B86D] disabled:text-muted-foreground disabled:cursor-not-allowed hover:underline underline-offset-2 transition-colors"
                      >
                        {resendSec > 0 ? `Resend in ${resendSec}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Auth;
