import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authAPI, utils } from '../services/api';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from state or URL params
  const intendedDestination = location.state?.destination || '';
  const returnTo = location.state?.returnTo || '/book';

  useEffect(() => {
    // If user is already logged in, redirect them
    if (utils.isAuthenticated()) {
      navigate(returnTo);
    }
  }, [navigate, returnTo]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(loginData);
      
      if (response.success) {
        toast.success('Login successful! Redirecting...', {
          position: "top-right",
          autoClose: 2000,
        });
        
        // Small delay to show success message
        setTimeout(() => {
          navigate(returnTo, { 
            state: { destination: intendedDestination }
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = utils.formatErrorMessage(error);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match!', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...submitData } = registerData;
      const response = await authAPI.register(submitData);
      
      if (response.success) {
        toast.success('Registration successful! Redirecting...', {
          position: "top-right",
          autoClose: 2000,
        });
        
        // Small delay to show success message
        setTimeout(() => {
          navigate(returnTo, { 
            state: { destination: intendedDestination }
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = utils.formatErrorMessage(error);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-700 to-blue-800 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-20 h-20 bg-white bg-opacity-10 rounded-full top-1/4 left-1/4 animate-float-slow"></div>
        <div className="absolute w-32 h-32 bg-white bg-opacity-5 rounded-full top-3/4 right-1/4 animate-float-slower"></div>
        <div className="absolute w-16 h-16 bg-white bg-opacity-10 rounded-full top-1/2 right-3/4 animate-float"></div>
        <div className="absolute w-24 h-24 bg-white bg-opacity-5 rounded-full bottom-1/4 left-3/4 animate-float-slow"></div>
      </div>

      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-white/10 backdrop-blur-md">
        <div className="w-full px-6">
          <div className="max-w-7xl mx-auto">
            <nav className="flex justify-between items-center py-4">
              <button
                onClick={handleBackToHome}
                className="text-3xl font-bold text-white hover:text-orange-300 transition-colors"
              >
                WanderWise
              </button>
              <button
                onClick={handleBackToHome}
                className="text-white hover:text-orange-300 transition-colors font-medium"
              >
                Back to Home
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full">
          {/* Glass Card Container */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 shadow-2xl">
            
            {/* Show intended destination if available */}
            {intendedDestination && (
              <div className="text-center mb-6">
                <div className="inline-block bg-orange-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  🌟 Planning trip to {intendedDestination}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {isLogin ? 'Welcome Back' : 'Join WanderWise'}
              </h1>
              <p className="text-white/90">
                {isLogin ? 'Sign in to continue your journey' : 'Create your account to start exploring'}
              </p>
            </div>

            {/* Toggle Buttons */}
            <div className="flex mb-6 bg-white/10 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  isLogin 
                    ? 'bg-white text-blue-700 shadow-md' 
                    : 'text-white hover:text-orange-300'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-white text-blue-700 shadow-md' 
                    : 'text-white hover:text-orange-300'
                }`}
              >
                Register
              </button>
            </div>

            {/* Forms Container */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl">
              {isLogin ? (
                /* Login Form */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      📧
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔐
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Password"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      👤
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                      required
                      minLength="2"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      📧
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                      required
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      📱
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      placeholder="Phone Number"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔐
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Password (min 6 characters)"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                      required
                      minLength="6"
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔐
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="Confirm Password"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                      required
                      minLength="6"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-white/80 mt-6">
              <p className="flex items-center justify-center space-x-2">
                <span>🔒</span>
                <span>Your information is secure and encrypted</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        }}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(90deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;