import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { requestForgotOtp, verifyForgotOtp, resetPassword, clearMessages, logout } from '../feature/auth/authSlice';
import { HiOutlineMail } from 'react-icons/hi';
import { MdOutlinePassword } from 'react-icons/md';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, successMessage, secret, resetToken } = useAppSelector((state) => state.auth);

  const [animate, setAnimate] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(error);
  const [localSuccessMessage, setLocalSuccessMessage] = useState<string | null>(successMessage);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      const timer = setTimeout(() => {
        setLocalError(null);
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      setLocalSuccessMessage(successMessage);
      const timer = setTimeout(() => {
        setLocalSuccessMessage(null);
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    // Clear messages and reset step when the route changes
    dispatch(clearMessages());
    setLocalError(null);
    setLocalSuccessMessage(null);
    setStep('email');
  }, [location, dispatch]);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(requestForgotOtp({ email })).then((res: any) => {
      if (res.meta.requestStatus === 'fulfilled') {
        setStep('otp');
      }
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;
    dispatch(verifyForgotOtp({ email, otp, secret })).then(() => setStep('reset'));
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert('Passwords do not match');
    if (!resetToken) return;
    dispatch(resetPassword({ newPassword, confirmPassword, resetToken })).then((res: any) => {
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(logout());
        navigate('/login');
      }
    });
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email': return 'Reset Password';
      case 'otp': return 'Verify Identity';
      case 'reset': return 'New Password';
      default: return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email': return 'Enter your email to receive OTP';
      case 'otp': return 'Check your email for verification code';
      case 'reset': return 'Create your new password';
      default: return 'Reset your password';
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden px-4">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-float-medium delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-orange-400 to-red-400 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-float-fast delay-2000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] animate-grid-move"></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Main Forgot Password Card */}
      <div className={`relative z-10 w-full max-w-md transform transition-all duration-1000 ${
        animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}>
        <div className="group relative p-8 rounded-3xl backdrop-blur-xl border border-white/20 bg-white/10 dark:bg-gray-900/20 shadow-2xl">
          {/* Hover Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500"></div>
          
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10">
            <div className="absolute inset-[2px] rounded-3xl bg-gray-50 dark:bg-gray-900"></div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 mb-2 animate-gradient-x">
                {getStepTitle()}
              </h2>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full animate-pulse-scale"></div>
            </div>
            <p className={`text-gray-600 dark:text-gray-300 mt-4 transition-all duration-1000 delay-300 ${
              animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              {getStepDescription()}
            </p>
          </div>

          {/* Messages */}
          {localError && (
            <div className={`mb-6 p-4 rounded-2xl bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800 backdrop-blur-sm transition-all duration-500 ${
              animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}>
              <p className="text-red-700 dark:text-red-300 text-center font-medium">{localError}</p>
            </div>
          )}

          {localSuccessMessage && (
            <div className={`mb-6 p-4 rounded-2xl bg-green-100/80 dark:bg-green-900/30 border border-green-200 dark:border-green-800 backdrop-blur-sm transition-all duration-500 ${
              animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}>
              <p className="text-green-700 dark:text-green-300 text-center font-medium">{localSuccessMessage}</p>
            </div>
          )}

          {/* Forms */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className={`relative transition-all duration-500 delay-200 ${
                animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <HiOutlineMail className="absolute top-4 left-4 text-gray-400 text-xl" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/30 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                className={`w-full py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transform transition-all duration-300 ${
                  hoveredButton ? 'scale-105 shadow-2xl' : 'scale-100 shadow-lg'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${
                  animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          )}

          {/* STEP 2 → OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className={`relative transition-all duration-500 delay-200 ${
                animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <MdOutlinePassword className="absolute top-4 left-4 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Enter OTP code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/30 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                className={`w-full py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transform transition-all duration-300 ${
                  hoveredButton ? 'scale-105 shadow-2xl' : 'scale-100 shadow-lg'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${
                  animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </span>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </form>
          )}

          {/* STEP 3 → RESET PASSWORD */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className={`relative transition-all duration-500 delay-200 ${
                animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <MdOutlinePassword className="absolute top-4 left-4 text-gray-400 text-xl" />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/30 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                />
              </div>

              <div className={`relative transition-all duration-500 delay-300 ${
                animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <MdOutlinePassword className="absolute top-4 left-4 text-gray-400 text-xl" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/30 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                className={`w-full py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transform transition-all duration-300 ${
                  hoveredButton ? 'scale-105 shadow-2xl' : 'scale-100 shadow-lg'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${
                  animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* Additional Links */}
          <div className={`mt-8 text-center text-sm transition-all duration-500 delay-500 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <p className="text-gray-600 dark:text-gray-300">
              Remembered your password?{' '}
              <Link
                to="/login"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors duration-300 hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -30px) scale(1.1); }
          66% { transform: translate(-30px, 40px) scale(0.9); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-40px, 50px) scale(1.05); }
          66% { transform: translate(60px, -20px) scale(0.95); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.2); }
        }
        @keyframes grid-move {
          0% { transform: translate(0px, 0px); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scaleX(1); opacity: 1; }
          50% { transform: scaleX(1.1); opacity: 0.8; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 12s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 10s ease-in-out infinite;
        }
        .animate-grid-move {
          animation: grid-move 20s linear infinite;
        }
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;