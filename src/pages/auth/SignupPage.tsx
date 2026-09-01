import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, AlertCircle, Check } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

export function SignupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-brand-500', 'bg-emerald-500'][passwordStrength];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!agree) {
      setError('Please accept the terms and conditions to continue.');
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signUpError) {
      setLoading(false);
      if (signUpError.message.includes('already')) {
        setError('An account with this email already exists. Try logging in instead.');
      } else {
        setError(signUpError.message);
      }
      return;
    }

    if (data.user) {
      toast('Account created! Welcome to AXIS Content Studio.');
      navigate('/app/dashboard');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start generating with AI in seconds"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-500 hover:text-brand-600">Log in</Link>
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
          label="Full name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          icon={<User className="w-4 h-4" />}
          autoComplete="name"
        />

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
            placeholder="At least 8 characters"
            icon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
          />
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${i < passwordStrength ? strengthColor : 'bg-ink-200 dark:bg-ink-700'}`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-ink-400">{strengthLabel}</p>
            </div>
          )}
        </div>

        <PasswordInput
          label="Confirm password"
          name="confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your password"
          icon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-ink-600 dark:text-ink-300">
            I agree to the Terms and Conditions and Privacy Policy
          </span>
        </label>

        <Button type="submit" className="w-full" loading={loading} disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Sign up'}
        </Button>
      </form>
    </AuthLayout>
  );
}
