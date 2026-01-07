import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import forgeLogo from '@/assets/forge-logo.png';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = authSchema.extend({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; fullName?: string }>({});
  
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (isSignUp) {
      const validation = signUpSchema.safeParse({ email, password, confirmPassword, fullName });
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
      const { error } = await signUp(email, password, fullName);
      setLoading(false);

      if (error) {
        if (error.message?.includes('already registered')) {
          toast({
            title: 'Account Exists',
            description: 'An account with this email already exists. Please sign in instead.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Sign Up Failed',
            description: error.message || 'Something went wrong. Please try again.',
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: 'Welcome to the Circle!',
        description: 'Please check your email to verify your account.',
      });
      setIsSignUp(false);
      resetForm();
    } else {
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
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center px-4 py-8 sm:p-6 bg-background safe-area-inset">
      {/* Enhanced Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative w-full max-w-md space-y-6 sm:space-y-8 animate-slide-up">
        {/* Logo and Header */}
        <div className="text-center space-y-4 sm:space-y-5">
          {/* Forge Logo with Glow */}
          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl" />
            <img 
              src={forgeLogo} 
              alt="Forge" 
              className="relative w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
            {isSignUp ? 'Join the Inner Circle' : 'Welcome Back, Creator'}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp 
              ? 'Your creative journey starts here'
              : 'Continue your creative journey'
            }
          </p>
        </div>

        {/* Glassmorphism Form Card */}
        <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-border/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 bg-secondary/50"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-secondary/50"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-secondary/50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-secondary/50 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="premium"
              size="xl"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isSignUp ? 'Joining the Circle...' : 'Entering...'}
                </>
              ) : (
                isSignUp ? 'Apply for the Circle' : 'Enter the Circle'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? (
            <>
              Already a member?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:underline font-medium"
              >
                Enter the Circle
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary hover:underline font-medium"
              >
                Apply for the Circle
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
