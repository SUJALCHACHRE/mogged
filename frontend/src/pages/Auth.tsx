import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, User } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'signup' && !form.fullName.trim()) e.fullName = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    if (mode === 'signup' && form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(form.email, form.password, form.fullName);
      } else {
        await signIn(form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({ form: err.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <AuthLayout>
        <div className="w-full max-w-md">
          <div className="glass rounded-2xl p-8">
            <div className="mb-8">
              <p className="text-label text-brand-purple-light">Account access</p>
              <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
                {mode === 'signin' ? 'Welcome back.' : 'Create your room.'}
              </h1>
            </div>

            <div className="relative mb-8 flex rounded-full border border-[var(--border-subtle)] bg-[rgba(246,239,227,0.05)] p-1">
              <motion.div
                className="absolute bottom-1 top-1 rounded-full bg-[var(--bg-cream)]"
                layoutId="authTab"
                style={{ width: 'calc(50% - 4px)', left: mode === 'signin' ? 4 : 'calc(50%)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`z-10 flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                  mode === 'signin' ? 'text-[var(--text-dark)]' : 'text-[var(--text-muted)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`z-10 flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                  mode === 'signup' ? 'text-[var(--text-dark)]' : 'text-[var(--text-muted)]'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Input
                    label="Full name"
                    placeholder="Your name"
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    error={errors.fullName}
                    icon={<User size={16} />}
                  />
                </motion.div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                error={errors.email}
                icon={<Mail size={16} />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                error={errors.password}
                icon={<Lock size={16} />}
              />

              {mode === 'signup' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <Input
                    label="Confirm password"
                    type="password"
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    error={errors.confirmPassword}
                    icon={<Lock size={16} />}
                  />
                </motion.div>
              )}

              {errors.form && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-brand-coral">
                  {errors.form}
                </motion.p>
              )}

              <Button type="submit" size="lg" className="w-full" isLoading={loading}>
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </AuthLayout>
    </PageWrapper>
  );
}
