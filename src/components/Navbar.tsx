// src/components/Navbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import ThemeToggle from './UI/ThemeToggle';
import { logout } from '../feature/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks';
import { Link } from 'react-router-dom';

const Navbar: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  
  // Use actual Redux state instead of static mock
  const auth = useAppSelector((state) => state.auth);
  const user = auth.user;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get profile image or use default
  const getProfileImage = () => {
    // If you have profileImageUrl in your user object, use it
    // Otherwise use a default image
    return user?.profileImageUrl || "https://flowbite.com/docs/images/people/profile-picture-5.jpg";
  };

  // Get user's full name
  const getFullName = () => {
    if (!user) return "User";
    return `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || user.email;
  };

  return (
    <>
      {/* Background blur effect */}
      <div className="fixed top-0 left-0 w-full h-16 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/50 z-40"></div>
      
      <nav className="fixed top-0 z-50 w-full bg-transparent flex items-center justify-between px-6 py-3">
        {/* Left Section - Brand & Menu Toggle */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-700/50 transition-all duration-300 group"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="relative w-4 h-4 flex flex-col justify-center">
                <span className={`absolute h-0.5 w-full bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 ${
                  isDropdownOpen ? 'rotate-45 translate-y-0' : '-translate-y-1'
                }`}></span>
                <span className={`absolute h-0.5 w-full bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 ${
                  isDropdownOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`absolute h-0.5 w-full bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 ${
                  isDropdownOpen ? '-rotate-45 -translate-y-0' : 'translate-y-1'
                }`}></span>
              </div>
            </div>
          </button>

          {/* Brand */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img
                src="https://www.reshot.com/preview-assets/icons/TGWNJPK4VX/beer-TGWNJPK4VX.svg"
                alt="Logo"
                className="mr-3 h-8 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 dark:from-purple-400 dark:via-pink-400 dark:to-purple-600 bg-clip-text text-transparent">
              Styled
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 border border-white/20 dark:border-gray-700/50">
            <ThemeToggle />
          </div>

          {/* User Avatar (with dropdown) - Only show if user is authenticated */}
          {auth.isAuthenticated && user && (
            <div className="relative" ref={dropdownRef}>
              <div 
                className="relative group cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img
                  src={getProfileImage()}
                  alt="User"
                  className="h-10 w-10 rounded-xl border-2 border-white/30 dark:border-gray-600/50 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-purple-400/50"
                />
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 rounded-xl group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-300">
                  {/* User info header */}
                  <div className="p-4 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                    <div className="flex items-center gap-3">
                      <img
                        src={getProfileImage()}
                        alt="User"
                        className="h-12 w-12 rounded-xl border-2 border-white/50"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {getFullName()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    {[
                      { icon: "📊", label: "Dashboard", href: "/dashboard" },
                      { icon: "⚙️", label: "Settings", href: "/settings" },
                      { icon: "💰", label: "Earnings", href: "/earnings" },
                    ].map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {item.label}
                        </span>
                      </a>
                    ))}
                  </div>

                  {/* Sign out button */}
                  <div className="p-2 border-t border-white/20 dark:border-gray-700/30">
                    <button
                      onClick={() => dispatch(logout())}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                    >
                      <span className="text-lg">🚪</span>
                      <span className="font-medium group-hover:text-red-700 dark:group-hover:text-red-300">
                        Sign out
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;