import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      if (signInError.message.includes('Invalid login')) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(signInError.message);
      }
      return;
    }

    toast('Welcome back! Redirecting to dashboard...');
    navigate('/app/dashboard');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your AXIS Content Studio account"
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-brand-500 hover:text-brand-600">Sign up</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        <div>
          <PasswordInput
            label="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            icon={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
          />
          <div className="flex justify-end mt-1.5">
            <Link to="/forgot-password" className="text-xs text-brand-500 hover:text-brand-600">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full" loading={loading} disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
