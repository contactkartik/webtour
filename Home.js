import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WanderWise = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const destinations = [
    {
      id: 1,
      name: "Ayodhya",
      image: "https://cdn.pixabay.com/photo/2015/08/11/12/29/ayodhya-nagri-884352_1280.jpg",
      description: "The sacred city on the banks of the Sarayu River, is revered as the birthplace of Lord Ram and a timeless symbol of faith and spirituality.",
      price: "₹15,000"
    },
    {
      id: 2,
      name: "Agra",
      image: "https://cdn.pixabay.com/photo/2019/03/12/20/19/india-4051753_1280.jpg",
      description: "Explore Agra, the historic city home to the iconic Taj Mahal and a rich legacy of Mughal architecture and heritage.",
      price: "₹12,000"
    },
    {
      id: 3,
      name: "Kullu Manali",
      image: "https://cdn.pixabay.com/photo/2024/07/20/15/52/mountains-8908538_1280.jpg",
      description: "Discover the enchanting beauty of Kullu-Manali, a serene Himalayan paradise known for its snow-capped peaks, adventure sports, and vibrant culture.",
      price: "₹20,000"
    },
    {
      id: 4,
      name: "Jaisalmer",
      image: "https://media.istockphoto.com/id/1413259233/photo/jaswant-thada-is-a-cenotaph-located-in-jodhpur-in-the-indian-state-of-rajasthan-jaisalmer.jpg?s=612x612&w=0&k=20&c=mZViKI0_it7NQpTHeUqtgdL-6CVfW18NZdJlKF7cIrU=",
      description: "A captivating blend of ancient fort life, vibrant desert culture, and stunning golden sandstone architecture, earning it the moniker 'The Golden City.'",
      price: "₹18,000"
    }
  ];

  const features = [
    {
      icon: "💰",
      title: "Best Price Guarantee",
      description: "We match any competitor's price and guarantee the best value for your dream vacation."
    },
    {
      icon: "🕒",
      title: "24/7 Customer Support",
      description: "Our dedicated team is available around the clock to assist you before, during, and after your trip."
    },
    {
      icon: "✋",
      title: "Handpicked Packages",
      description: "Every destination and experience is carefully selected by our travel experts for quality and authenticity."
    }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlanTrip = () => {
    navigate('/book');
  };

  const handleViewDetails = (destination) => {
    navigate(`/book/${destination.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="font-sans leading-relaxed text-gray-800">
      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/95 backdrop-blur-md'
      }`}>
        <div className="w-full px-6">
          <div className="max-w-7xl mx-auto">
            <nav className="flex justify-between items-center py-4">
              <a 
                href="#home" 
                className="text-3xl font-bold text-blue-700 hover:text-orange-500 transition-colors"
                onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}
              >
                WanderWise
              </a>
              <ul className="hidden md:flex space-x-8">
                {['home', 'destinations', 'packages', 'about', 'contact'].map((item) => (
                  <li key={item}>
                    <a 
                      href={`#${item}`}
                      className="text-blue-700 font-medium hover:text-orange-500 transition-colors capitalize"
                      onClick={(e) => { e.preventDefault(); scrollToSection(item); }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="md:hidden">
                <button className="text-blue-700 text-2xl">☰</button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="home"
        className="h-screen bg-cover bg-center bg-fixed flex items-center justify-center text-center text-white relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      >
        <div className="hero-content animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Explore The World With WanderWise
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Curated trips. Unforgettable experiences.
          </p>
          <button 
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={handlePlanTrip}
          >
            Plan Your Trip
          </button>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-semibold text-center text-blue-700 mb-12">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinations.map((destination) => (
              <div 
                key={destination.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-64 object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {destination.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">
                    {destination.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {destination.description}
                  </p>
                  <button 
                    className="border-2 border-orange-500 text-orange-500 px-6 py-2 rounded-full font-medium hover:bg-orange-500 hover:text-white transition-all duration-300"
                    onClick={() => handleViewDetails(destination)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="packages" className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-semibold text-center text-blue-700 mb-12">
            Why Choose WanderWise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-blue-700 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-semibold text-center text-blue-700 mb-12">
            What Our Travelers Say
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
                alt="Suresh Kumar Singh"
                className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-orange-500"
              />
              <p className="text-lg text-gray-600 italic mb-4 leading-relaxed">
                "Our Ayodhya tour was a deeply spiritual and unforgettable experience, filled with divine energy and rich cultural heritage."
              </p>
              <h4 className="text-blue-700 font-semibold text-lg">
                Suresh Kumar Singh
              </h4>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-blue-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-semibold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90">
            Subscribe to our newsletter for exclusive travel deals and inspiration
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="px-6 py-4 rounded-full text-gray-800 flex-1 outline-none"
            />
            <button className="bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-full font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-semibold text-orange-500 mb-4">
                About WanderWise
              </h3>
              <p className="text-gray-300 leading-relaxed">
                We're passionate about creating unforgettable travel experiences that connect you with the world's most amazing destinations and cultures.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-orange-500 mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                {['Home', 'Destinations', 'Packages', 'About', 'Contact'].map((link) => (
                  <a 
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="block text-gray-300 hover:text-orange-500 transition-colors"
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.toLowerCase()); }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-orange-500 mb-4">
                Follow Us
              </h3>
              <p className="text-gray-300 mb-4">Stay connected for travel inspiration</p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-xl hover:bg-orange-600 transition-colors">
                  📷
                </a>
                <a href="#" className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-xl hover:bg-orange-600 transition-colors">
                  🐦
                </a>
                <a href="#" className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-xl hover:bg-orange-600 transition-colors">
                  📘
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 WanderWise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WanderWise;