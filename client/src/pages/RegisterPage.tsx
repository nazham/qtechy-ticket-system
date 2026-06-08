import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { extractApiError } from '../api/utils';
import { useAppSelector } from '../store/hooks';
import { useRegisterUserMutation } from '../store/slices/authApi';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';

export default function RegisterPage() {
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
              <UserPlus className="text-white" size={26} />
            </div>
            <h1 className="text-2xl font-bold text-white">Create an account</h1>
            <p className="mt-1 text-sm text-gray-400">
              Get started with QTechy Ticket System
            </p>
          </div>

          {/* Error banner */}
          {(localError || apiError) && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {localError || extractApiError(apiError, 'Registration failed')}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="register-name"
                className="mb-1.5 block text-sm font-medium text-gray-300"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="mb-1.5 block text-sm font-medium text-gray-300"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 transition-colors outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="mb-1.5 block text-sm font-medium text-gray-300"
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
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
