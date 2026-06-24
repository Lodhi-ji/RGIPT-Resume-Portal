import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_EMAIL = '23cd3054@rgipt.ac.in';
const DEMO_PASSWORD = '23Cd3054';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting login with:', email);

    try {
      const user = await login(email, password);
      console.log('Login successful:', user);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh h-dvh overflow-y-auto bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md my-auto py-2">
        {/* Logo and Header */}
        <div className="text-center mb-4">
          <img 
            src="/rgipt_logo.png" 
            alt="RGIPT Logo" 
            className="h-14 sm:h-16 mx-auto mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">RGIPT Resume Portal</h1>
          <p className="text-gray-600 mt-1 text-sm">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl p-5 sm:p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Institute Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="your.email@rgipt.ac.in"
                required
                disabled={loading}
              />
            </div>

            {/* Password Input with Toggle */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-12 border-2 border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700
                           focus:outline-none focus:text-blue-500 transition-colors"
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 
                       text-white text-sm font-semibold rounded-lg
                       transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 text-xs sm:text-sm text-blue-800">
                <p className="font-semibold text-blue-900 mb-1">Demo Credentials</p>
                <p className="truncate"><span className="font-medium">Email:</span> {DEMO_EMAIL}</p>
                <p><span className="font-medium">Password:</span> {DEMO_PASSWORD}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail(DEMO_EMAIL);
                  setPassword(DEMO_PASSWORD);
                }}
                className="shrink-0 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors whitespace-nowrap"
                disabled={loading}
              >
                Use demo
              </button>
            </div>
          </div>

          {/* Sign Up and Forgot Password Links */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <Link 
              to="/activate-account" 
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign Up / Activate Account
            </Link>
            <Link 
              to="/forgot-password" 
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Login;
