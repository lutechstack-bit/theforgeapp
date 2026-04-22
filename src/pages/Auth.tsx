import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import forgeLogo from '@/assets/forge-logo.png';
import forgeLogoLight from '@/assets/forge-logo-light.png';

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
 */

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();

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

  return (
    <main className="min-h-[100dvh] w-full grid grid-cols-1 lg:grid-cols-[35fr_65fr] bg-black text-foreground overflow-x-hidden">
      {/* ─────────────── Video pane (right on desktop, top on mobile) ─────────────── */}
      <section className="relative overflow-hidden bg-black order-1 lg:order-2 h-[50vh] lg:h-auto lg:min-h-screen">
        <video
          src="/login/Forge_website.mp4"
          poster="/login/Forge_website_poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Desktop vignette: subtle horizontal edge-blend + radial darken */}
        <div
          aria-hidden
          className="hidden lg:block absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0) 18%, rgba(10,10,10,0) 82%, rgba(10,10,10,0.25) 100%), radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
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
        <p className="absolute z-[3] left-5 lg:left-11 right-5 lg:right-auto bottom-20 lg:bottom-3 lg:max-w-[720px] font-fraunces italic font-medium text-[20px] lg:text-[44px] leading-[1.2] lg:leading-[1.15] tracking-[-0.3px] lg:tracking-[-0.4px] max-w-[260px] lg:max-w-[720px] text-[#F5F1E8] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] animate-fade-up">
          Your journey from Dreamer to Doer starts here
        </p>
      </section>

      {/* ─────────────── Login pane (left on desktop, bottom on mobile) ─────────────── */}
      <section
        className="relative flex flex-col items-center justify-center bg-black px-5 py-6 lg:px-20 lg:py-20 order-2 lg:order-1 -mt-24 lg:mt-0 z-[4] lg:z-auto"
      >
        <div className="relative w-full max-w-[420px] flex flex-col items-center animate-fade-up">
          {/* Desktop logo with radial glow (hidden on mobile — replaced by overlay above) */}
          <div className="relative w-[240px] h-[100px] hidden lg:flex items-center justify-center mb-10">
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

          <h1 className="mt-1 lg:mt-6 text-[24px] lg:text-[32px] font-bold text-primary text-center leading-[1.15] tracking-[-0.4px]">
            Welcome Creator
          </h1>
          <p className="mt-1.5 lg:mt-3.5 mb-4 lg:mb-10 text-[13px] lg:text-[15px] text-muted-foreground text-center">
            Continue your creative journey
          </p>

          <form
            onSubmit={handleSubmit}
            className="w-full lg:bg-[#141414] lg:border lg:border-primary/[0.08] lg:rounded-[20px] lg:p-7 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_20px_50px_rgba(0,0,0,0.5)] lg:backdrop-blur-[10px]"
          >
            {/* Email */}
            <div className="mb-2.5">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full bg-white/[0.04] lg:bg-[#1C1C1C] border border-white/[0.08] lg:border-[rgba(245,241,232,0.06)] rounded-[14px] lg:rounded-xl px-5 py-[13px] lg:py-[18px] text-[15px] text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] lg:focus:bg-[#1F1F1F]"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1.5 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end mt-1 mb-2.5 mx-0.5">
              <Link
                to="/forgot-password"
                className="text-[13px] font-medium text-primary/90 hover:text-primary hover:underline underline-offset-[3px] transition-opacity"
              >
                Forgot password?
              </Link>
            </div>

            {/* Password with eye toggle */}
            <div className="relative mb-2.5">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-white/[0.04] lg:bg-[#1C1C1C] border border-white/[0.08] lg:border-[rgba(245,241,232,0.06)] rounded-[14px] lg:rounded-xl px-5 py-[13px] lg:py-[18px] pr-12 text-[15px] text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] lg:focus:bg-[#1F1F1F]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-[18px] top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.password && (
                <p className="text-xs text-destructive mt-1.5 ml-1">{errors.password}</p>
              )}
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-[14px] lg:py-[17px] mt-2 rounded-[14px] text-[#111] font-semibold text-base tracking-[0.1px] bg-gradient-to-b from-[#F5C76A] via-primary to-[#D99A1F] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_25px_rgba(255,188,59,0.18),0_2px_6px_rgba(0,0,0,0.3)] hover:brightness-[1.04] hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_14px_32px_rgba(255,188,59,0.28),0_3px_8px_rgba(0,0,0,0.35)] active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
          </form>
        </div>
      </section>
    </main>
  );
};

export default Auth;
