import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm';

const BookingPage = () => {
  const { destination } = useParams();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format destination name for display
  const formatDestination = (dest) => {
    if (!dest) return '';
    return dest.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
        <div className="absolute w-28 h-28 bg-white bg-opacity-10 rounded-full top-1/6 right-1/6 animate-float-slower"></div>
      </div>

      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/10 backdrop-blur-md'
      }`}>
        <div className="w-full px-6">
          <div className="max-w-7xl mx-auto">
            <nav className="flex justify-between items-center py-4">
              <button
                onClick={handleBackToHome}
                className={`text-3xl font-bold transition-colors ${
                  isScrolled ? 'text-blue-700 hover:text-orange-500' : 'text-white hover:text-orange-300'
                }`}
              >
                WanderWise
              </button>
              <ul className="hidden md:flex space-x-8">
                <li>
                  <button
                    onClick={handleBackToHome}
                    className={`font-medium transition-colors ${
                      isScrolled ? 'text-blue-700 hover:text-orange-500' : 'text-white hover:text-orange-300'
                    }`}
                  >
                    Back to Home
                  </button>
                </li>
              </ul>
              <div className="md:hidden">
                <button
                  onClick={handleBackToHome}
                  className={`text-2xl transition-colors ${
                    isScrolled ? 'text-blue-700' : 'text-white'
                  }`}
                >
                  ←
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Glass Card Container */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                Book Your Trip
              </h1>
              {destination && (
                <div className="inline-block bg-orange-500/90 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
                  🌟 {formatDestination(destination)}
                </div>
              )}
              <p className="text-lg text-white/90 font-light">
                Let's create your perfect adventure together
              </p>
            </div>
            
            {/* Booking Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl">
              <BookingForm preSelectedDestination={formatDestination(destination)} />
            </div>
          </div>
        </div>
      </main>

      <style>{`
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

export default BookingPage;