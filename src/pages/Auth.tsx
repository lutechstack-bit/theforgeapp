import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import forgeLogo from '@/assets/forge-logo.png';

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
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center px-4 py-8 sm:p-6 bg-background safe-area-inset">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative w-full max-w-md space-y-6 sm:space-y-8 animate-slide-up">
        <div className="text-center space-y-4 sm:space-y-5">
          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl" />
            <img 
              src={forgeLogo} 
              alt="Forge" 
              className="relative w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
            Welcome Back, Creator
          </h1>
          <p className="text-muted-foreground">
            Continue your creative journey
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-border/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <FloatingInput
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/50"
              error={errors.email}
            />

            <div>
              <div className="flex items-center justify-end mb-1">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FloatingInput
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/50 pr-12"
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

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
                  Entering...
                </>
              ) : (
                'Enter the Circle'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
