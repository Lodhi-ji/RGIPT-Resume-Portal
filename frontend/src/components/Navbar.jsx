import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo and Brand */}
          <div className="flex items-center gap-3">
            <img 
              src="/rgipt_logo.png" 
              alt="RGIPT Logo" 
              className="h-10"
            />
            <Link 
              to="/" 
              className="text-xl font-bold text-gray-900 hover:text-blue-500 transition-colors"
            >
              RGIPT Resume Portal
            </Link>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-500 hover:bg-blue-50'
                }`}
              >
                Dashboard
              </Link>
              
              {user.role === 'student' && (
                <>
                  <Link 
                    to="/profile" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/profile') 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/resumes" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/resumes') 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    Resumes
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Right: User Info and Logout (Desktop) */}
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 
                         text-gray-800 font-semibold rounded-md text-sm
                         transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <button 
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {/* User Info */}
            <div className="px-3 py-2 border-b border-gray-200 mb-2">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>

            {/* Navigation Links */}
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-500'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            
            {user.role === 'student' && (
              <>
                <Link 
                  to="/profile" 
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/profile') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-500'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link 
                  to="/resumes" 
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/resumes') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-500'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Resumes
                </Link>
              </>
            )}

            {/* Logout Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2 bg-gray-200 hover:bg-gray-300 
                       text-gray-800 font-semibold rounded-md text-sm
                       transition-colors duration-200 mt-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
