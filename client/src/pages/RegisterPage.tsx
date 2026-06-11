import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { extractApiError } from '../api/utils';
import { useAppSelector } from '../store/hooks';
import { useRegisterUserMutation } from '../store/slices/authApi';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function RegisterPage() {
  useDocumentTitle('Register');

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const [registerUser, { isLoading, error: apiError }] =
    useRegisterUserMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setLocalError(null);

    const nameTrimmed = name.trim();
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Client-side validations matching backend constraints
    if (!nameTrimmed) {
      setLocalError('Full name is required');
      return;
    }
    if (nameTrimmed.length < 2) {
      setLocalError('Name must be at least 2 characters');
      return;
    }
    if (nameTrimmed.length > 60) {
      setLocalError('Name must not exceed 60 characters');
      return;
    }
    if (!emailTrimmed) {
      setLocalError('Email address is required');
      return;
    }
    if (!emailRegex.test(emailTrimmed)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    if (password.length > 72) {
      setLocalError('Password must not exceed 72 characters');
      return;
    }

    try {
      await registerUser({
        name: nameTrimmed,
        email: emailTrimmed,
        password,
      }).unwrap();
      toast.success('Account created successfully! Welcome to QTechy.');
    } catch (err) {
      toast.error(extractApiError(err, 'Registration failed'));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark-base px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-premium-card border border-dark-border bg-dark-surface/80 p-8 shadow-2xl backdrop-blur-xl">
          {/* Branding */}
          <div className="mb-8 text-center">
            <img
              src="/favicon.svg"
              className="mx-auto mb-4 h-14 w-14 rounded-xl shadow-lg shadow-brand-accent/25"
              alt="QTechy Logo"
            />
            <h1 className="text-2xl font-bold text-dark-text-primary">
              Create an account
            </h1>
            <p className="mt-1.5 text-sm text-dark-text-secondary">
              Get started with QTechy Ticket System
            </p>
          </div>

          {/* Error banner */}
          {(localError || apiError) && (
            <div className="mb-6 rounded-lg border border-ui-danger/20 bg-ui-danger/10 px-4 py-3 text-sm text-ui-danger">
              {localError || extractApiError(apiError, 'Registration failed')}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="register-name"
                className="mb-1.5 block text-sm font-medium text-dark-text-secondary"
              >
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (localError) setLocalError(null);
                }}
                disabled={isLoading}
                className="w-full rounded-lg border border-dark-border bg-dark-base/50 px-4 py-2.5 text-sm text-dark-text-primary placeholder-dark-text-muted transition-colors outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent disabled:opacity-50"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="mb-1.5 block text-sm font-medium text-dark-text-secondary"
              >
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (localError) setLocalError(null);
                }}
                disabled={isLoading}
                className="w-full rounded-lg border border-dark-border bg-dark-base/50 px-4 py-2.5 text-sm text-dark-text-primary placeholder-dark-text-muted transition-colors outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="mb-1.5 block text-sm font-medium text-dark-text-secondary"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-dark-border bg-dark-base/50 px-4 py-2.5 pr-11 text-sm text-dark-text-primary placeholder-dark-text-muted transition-colors outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-dark-text-secondary transition-colors hover:text-dark-text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Register
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-dark-text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-brand-accent transition-colors hover:text-brand-accent-hover"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
