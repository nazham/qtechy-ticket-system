import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/slices/authApi';
import { extractApiError } from '../api/utils';

interface LocationState {
  from?: Location | string;
}

export default function LoginPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const [login, { isLoading, error: apiError }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const location = useLocation();
  const rawFrom = (location.state as LocationState | null)?.from;
  const isFromLogin = rawFrom
    ? typeof rawFrom === 'string'
      ? rawFrom === '/login'
      : rawFrom.pathname === '/login'
    : false;
  const from = rawFrom && !isFromLogin ? rawFrom : '/dashboard';

  // If already logged in with a valid user, bounce straight to the intended route or dashboard
  if (isAuthenticated && user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setLocalError(null);

    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    try {
      await login({ email: emailTrimmed, password }).unwrap();
      toast.success('Signed in successfully!');
    } catch (err) {
      toast.error(extractApiError(err, 'Login failed'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-indigo-900 px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          {/* Branding */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
              <LogIn className="text-white" size={26} />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-400">
              Sign in to your QTechy account
            </p>
          </div>

          {/* Error banner */}
          {(localError || apiError) && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {localError || extractApiError(apiError, 'Login failed')}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (localError) setLocalError(null);
                }}
                disabled={isLoading}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-11 text-sm text-white placeholder-gray-500 transition-colors outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-200"
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
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
