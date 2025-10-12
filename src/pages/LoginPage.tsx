import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { loginUser, verifyOtp } from '../feature/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { HiUser } from 'react-icons/hi';
import { CiLock } from 'react-icons/ci';
import { MdOutlinePassword } from 'react-icons/md';
// import { FcGoogle } from 'react-icons/fc';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage, step, secret } = useAppSelector((state) => state.auth);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;
    dispatch(verifyOtp({ email, secret, otp })).then((res: any) => {
      if (res.meta.requestStatus === 'fulfilled') navigate('/dashboard');
    });
  };

  // const handleGoogleLogin = () => {
  //   const googleAuthUrl = "http://localhost:5000/api/v1/auth/google";
  //   const width = 600, height = 700;
  //   const left = window.screenX + (window.outerWidth - width) / 2;
  //   const top = window.screenY + (window.outerHeight - height) / 2;

  //   const popup = window.open(
  //     googleAuthUrl,
  //     'Google Login',
  //     `width=${width},height=${height},left=${left},top=${top}`
  //   );

  //   // Listen for message from popup
  //   window.addEventListener('message', (event) => {
  //     if (event.origin !== "http://localhost:5173") return; // adjust if different
  //     if (event.data.type === 'google-login-success') {
  //       const { user, tokens } = event.data.payload;
  //       // Store tokens and user
  //       localStorage.setItem('accessToken', tokens.accessToken);
  //       localStorage.setItem('refreshToken', tokens.refreshToken);
  //       localStorage.setItem('user', JSON.stringify(user));

  //       navigate('/dashboard');
  //       popup?.close();
  //     }
  //   });
  // };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary dark:text-blue-400">
          {step === 'login' ? 'Welcome Back' : 'Enter OTP'}
        </h2>

        {error && <p className="mb-4 text-red-700 bg-red-100 p-2 rounded text-center">{error}</p>}
        {successMessage && <p className="mb-4 text-green-700 bg-green-100 p-2 rounded text-center">{successMessage}</p>}

        {step === 'login' && (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="relative">
              <HiUser className="absolute top-3 left-3 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            <div className="relative">
              <CiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {loading ? 'Sending OTP...' : 'Login'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <div className="relative">
              <MdOutlinePassword className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {/* Google Login */}
        {/* <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FcGoogle size={20} /> Continue with Google
          </button>
        </div> */}

        {/* Additional Links */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
              Reset here
            </Link>
          </p>
          <p className="mt-2">
            Don’t have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
