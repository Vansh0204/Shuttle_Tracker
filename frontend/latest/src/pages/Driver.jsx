import React, { useEffect, useState } from 'react';
import BusCard from '../components/BusCard';
import toast, { Toaster } from 'react-hot-toast';
import TrackShuttle from './TrackShuttle';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../services/authService';

function Driver() {
  const [dateTime, setDateTime] = useState(new Date());
  const [showForm, setShowForm] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [busNo, setBusNo] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [location, setLocation] = useState('Campus');
  const [driverLocation, setDriverLocation] = useState(null);
  const [googleUser, setGoogleUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.refreshUserData();
          if (user) {
            setDriverName(user.name);
            setBusNo(user.busNumber);
            setMobileNo(user.mobileNumber);
            setLocation(user.currentLocation);
            setIsLoggedIn(true);
            setShowForm(false);
            setShowLogin(false);
            setShowRegister(false);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          authService.logout();
        }
      }
    };

    checkAuthStatus();
  }, []);

  // Handle driver details submission
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    
    if (!driverName || !busNo || !mobileNo || !location) {
      toast.error('Please fill in all the required fields.', {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 2000,
      });
      return;
    }

    setIsRegistering(true);
    
    try {
      // Save details and proceed to registration
      setShowForm(false);
      setShowRegister(true);
      toast.success('Details saved! Please create your account.', {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 1200,
        iconTheme: { primary: '#22c55e', secondary: '#fff' },
      });
    } catch (error) {
      toast.error('Failed to save details. Please try again.', {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 2500,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields.', {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 2000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.', {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 2000,
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.', {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.registerDriver({
        name: driverName,
        email: email,
        password: password,
        busNo: busNo,
        mobileNo: mobileNo,
        location: location
      });
      
      toast.success('Registration successful! Welcome aboard.', {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 1200,
        iconTheme: { primary: '#22c55e', secondary: '#fff' },
      });

      setTimeout(() => {
        setShowRegister(false);
        setIsLoggedIn(true);
      }, 1200);
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.message.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please login instead.';
      } else if (error.message.includes('bus number')) {
        errorMessage = 'This bus number is already assigned to another driver.';
      }
      
      toast.error(errorMessage, {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simple JWT decoder for Google tokens
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = decodeJWT(credentialResponse.credential);
      if (!decoded) {
        throw new Error('Failed to decode Google token');
      }

      setGoogleUser(decoded);

      // Auto-fill driver details from Google profile
      if (decoded.name) {
        setDriverName(decoded.name);
      }
      if (decoded.email) {
        setEmail(decoded.email);
      }

      // Try to login with Google
      try {
        await authService.googleLogin(decoded);
        toast.success('Google login successful!', {
          position: 'top-center',
          style: { fontSize: '1.1rem', fontWeight: 'bold' },
          duration: 1200,
          iconTheme: { primary: '#22c55e', secondary: '#fff' },
        });

        // Proceed to dashboard
        setTimeout(() => {
          setShowLogin(false);
          setShowRegister(false);
          setIsLoggedIn(true);
        }, 1200);
      } catch (googleError) {
        // If Google login fails, user needs to register first
        toast.error('Please register with your driver details first.', {
          position: 'top-center',
          style: { fontSize: '1.1rem', fontWeight: 'bold' },
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.', {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 2500,
      });
    }
  };

  // Handle Google login error
  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.', {
      position: 'top-center',
      style: { fontSize: '1.1rem', fontWeight: 'bold' },
      duration: 2500,
    });
  };

  // Handle regular login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password.', {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 2500,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.login(email, password);
      
      toast.success('Login successful! Welcome back.', {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 1200,
        iconTheme: { primary: '#22c55e', secondary: '#fff' },
      });

      setTimeout(() => {
        setShowLogin(false);
        setShowRegister(false);
        setIsLoggedIn(true);
      }, 1200);
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.message.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message.includes('deactivated')) {
        errorMessage = 'Account has been deactivated. Please contact admin.';
      }
      
      toast.error(errorMessage, {
        position: 'top-center',
        style: { fontSize: '1.1rem', fontWeight: 'bold' },
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setShowForm(true);
    setShowLogin(false);
    setShowRegister(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDriverName('');
    setBusNo('');
    setMobileNo('');
    setLocation('Campus');
    setGoogleUser(null);
    
    toast.success('Logged out successfully.', {
      position: 'top-center',
      style: { fontSize: '1.1rem', fontWeight: 'bold' },
      duration: 1200,
    });
  };

  // Driver details form
  if (showForm) {
    return (
      <div className="flex flex-col items-center justify-center w-full px-4 py-6 md:py-8 bg-white dark:bg-gray-900 min-h-[70vh]">
        <Toaster />
        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Driver Details
          </h2>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">
                Bus Number
              </label>
              <input
                type="text"
                value={busNo}
                onChange={(e) => setBusNo(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter bus number"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                required
                pattern="[0-9]{10}"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mobile number"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-1">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Campus">Campus</option>
                <option value="Hostel">Hostel</option>
                <option value="On the Way">On the Way</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isRegistering}
              className={`w-full py-2.5 px-4 text-white font-medium rounded-lg transition-colors ${
                isRegistering
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              }`}
            >
              {isRegistering ? 'Saving...' : 'Next: Create Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Registration form
  if (showRegister) {
    return (
      <div className="flex flex-col items-center justify-start w-full px-4 py-6 md:py-8 bg-white dark:bg-gray-900 min-h-[70vh]">
        <Toaster
          position="top-center"
          toastOptions={{
            style: { fontSize: '1.1rem', fontWeight: 'bold' },
            duration: 2500,
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            className: 'animate__animated animate__fadeInDown',
          }}
        />
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="p-3 rounded-xl bg-transparent">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500">
                <div className="w-5 h-5 md:w-6 md:h-6 border-4 border-white dark:border-gray-800 rounded-full border-t-transparent border-l-transparent transform rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h1>
            <h6 className="text-sm font-semibold text-gray-600 dark:text-gray-300 text-center">
              Set up your driver account
            </h6>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-2.5 md:py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2.5 md:py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm Password"
                className="w-full pl-10 pr-4 py-2.5 md:py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 md:py-3 px-4 text-white font-medium rounded-lg transition-colors ${
                isLoading
                  ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          {/* Login link */}
          <div className="text-center mt-4">
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button 
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Login form
  if (showLogin) {
    return (
      <div className="flex flex-col items-center justify-start w-full px-4 py-6 md:py-8 bg-white dark:bg-gray-900 min-h-[70vh]">
        <Toaster
          position="top-center"
          toastOptions={{
            style: { fontSize: '1.1rem', fontWeight: 'bold' },
            duration: 2500,
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            className: 'animate__animated animate__fadeInDown',
          }}
        />
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="p-3 rounded-xl bg-transparent">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500">
                <div className="w-5 h-5 md:w-6 md:h-6 border-4 border-white dark:border-gray-800 rounded-full border-t-transparent border-l-transparent transform rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <h6 className="text-sm font-semibold text-gray-600 dark:text-gray-300 text-center">
              Stay on schedule. Keep students moving.
            </h6>

            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Don't have an account yet?{' '}
              <button 
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-2.5 md:py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2.5 md:py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end -mt-1 mb-1">
              <button
                type="button"
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 md:py-3 px-4 text-white font-medium rounded-lg transition-colors ${
                isLoading
                  ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  if (isLoggedIn) {
    return (
      <div className="px-4 py-6 sm:p-8 max-w-3xl mx-auto">
        <div className="text-sm sm:text-base text-center font-bold text-gray-600 dark:text-gray-300 mb-4">
          {dateTime.toLocaleString()}
        </div>
        
        {/* Header with logout button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Driver Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
        
        <BusCard
          driverName={googleUser?.name || driverName}
          busNo={busNo}
          mobileNo={mobileNo}
          location={location}
          onLocationUpdate={setDriverLocation}
          googleUser={googleUser}
        />
        
        {/* Show map only when route started */}
        {driverLocation && (
          <div className="mt-8">
            <TrackShuttle driverLocation={driverLocation} />
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default Driver;
