import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookingForm = ({ preSelectedDestination }) => {
  const [formData, setFormData] = useState({
    user: '',
    customerEmail: '', // Changed from 'email' to match backend
    contactNumber: '', // Changed from 'phone' to match backend
    destination: preSelectedDestination || '',
    date: '',
    people: 1,
    totalAmount: 0,
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (preSelectedDestination) {
      setFormData(prev => ({
        ...prev,
        destination: preSelectedDestination
      }));
    }
  }, [preSelectedDestination]);

  const destinations = [
    { value: 'Ayodhya', label: '🕉️ Ayodhya - Spiritual Journey', price: 15000 },
    { value: 'Agra', label: '🏛️ Agra - Monument of Love', price: 12000 },
    { value: 'Kullu Manali', label: '🏔️ Kullu Manali - Mountain Paradise', price: 20000 },
    { value: 'Jaisalmer', label: '🏜️ Jaisalmer - Golden Desert', price: 18000 }
  ];

  // Enhanced validation function
  const validateFormData = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.user.trim()) {
      newErrors.user = 'Full name is required';
    } else if (formData.user.trim().length < 2) {
      newErrors.user = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.user.trim())) {
      newErrors.user = 'Name should contain only letters and spaces';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    
    // Phone validation (Indian mobile numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.contactNumber.replace(/\s+/g, '');
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Phone number is required';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit mobile number starting with 6-9';
    }
    
    // Destination validation
    if (!formData.destination) {
      newErrors.destination = 'Please select a destination';
    }
    
    // Date validation
    if (!formData.date) {
      newErrors.date = 'Travel date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Travel date cannot be in the past';
      }
      
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() + 1);
      if (selectedDate > maxDate) {
        newErrors.date = 'Travel date cannot be more than 1 year in advance';
      }
    }
    
    // People validation
    if (!formData.people || formData.people < 1 || formData.people > 20) {
      newErrors.people = 'Number of people must be between 1 and 20';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Phone number formatting
    if (name === 'contactNumber') {
      const formatted = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else if (name === 'destination' || name === 'people') {
      const selectedDestination = destinations.find(dest => 
        dest.value === (name === 'destination' ? value : formData.destination)
      );
      const peopleCount = name === 'people' ? parseInt(value) : formData.people;
      const totalAmount = selectedDestination ? selectedDestination.price * peopleCount : 0;
      
      setFormData(prev => ({
        ...prev,
        [name]: name === 'people' ? parseInt(value) : value,
        totalAmount: totalAmount
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateFormData()) {
      // Show first error
      const firstError = Object.values(errors)[0];
      toast.error(firstError, {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log('🚀 Form submission started');
    console.log('📝 Form data:', JSON.stringify(formData, null, 2));

    try {
      // Check if backend is available by testing the connection first
      let backendAvailable = true;
      
      try {
        await fetch('http://localhost:5000/api/bookings', {
  method: 'GET',
});

 // Just check if endpoint exists
        
      } catch (error) {
        console.warn('⚠️ Backend not available, using demo mode');
        backendAvailable = false;
      }

      let data;
      
      if (backendAvailable) {
        // Try to connect to backend
        console.log('🔗 Attempting to connect to:', 'http://localhost:5000/api/bookings');
        
        const response = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        console.log('📡 Response received - Status:', response.status);
        
        const responseText = await response.text();
        console.log('📄 Raw response text:', responseText);
        
        if (!responseText) {
          throw new Error('Empty response from server');
        }
        
        try {
          data = JSON.parse(responseText);
          console.log('✅ Parsed response data:', data);
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          throw new Error('Server returned invalid JSON response');
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || `Server error: ${response.status}`);
        }
      } else {
        // Demo mode - create mock booking data
        console.log('🎭 Running in demo mode');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        data = {
          success: true,
          data: {
            _id: `demo_${Date.now()}`,
            referenceId: `WW${Date.now().toString().slice(-6)}`,
            ...formData,
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: new Date().toISOString()
          }
        };
      }

      console.log('🎉 Booking successful!');
      toast.success('Booking created successfully! Redirecting to payment...', {
        position: "top-right",
        autoClose: 2000,
      });
      
      // Navigate to payment page immediately with booking data
      setTimeout(() => {
        console.log('🧭 Navigating to payment page with data:', {
          bookingData: data.data,
          userEmail: formData.customerEmail // Fixed: use customerEmail instead of email
        });
        
        navigate('/payment', {
          state: {
            bookingData: data.data,
            userEmail: formData.customerEmail // Fixed: use customerEmail instead of email
          }
        });
      }, 1000);

    } catch (err) {
      console.error('💥 Booking error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = '🔌 Cannot connect to server. Running in demo mode...';
        
        // If fetch fails, run in demo mode
        try {
          console.log('🎭 Fallback to demo mode');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const demoData = {
            success: true,
            data: {
              _id: `demo_${Date.now()}`,
              referenceId: `WW${Date.now().toString().slice(-6)}`,
              ...formData,
              status: 'pending',
              paymentStatus: 'pending',
              createdAt: new Date().toISOString()
            }
          };
          
          toast.success('Demo booking created! Redirecting to payment...', {
            position: "top-right",
            autoClose: 2000,
          });
          
          setTimeout(() => {
            navigate('/payment', {
              state: {
                bookingData: demoData.data,
                userEmail: formData.customerEmail
              }
            });
          }, 1000);
          
          return; // Exit the catch block
          
        } catch (demoError) {
          errorMessage = 'Demo mode failed. Please refresh and try again.';
        }
      } else if (err.message.includes('JSON')) {
        errorMessage = '📡 Server returned invalid response format.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 7000,
      });
    } finally {
      console.log('🏁 Form submission completed');
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Name Field */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10 text-sm">
            👤
          </div>
          <input
            type="text"
            name="user"
            value={formData.user}
            onChange={handleChange}
            placeholder="Your Full Name"
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 hover:border-gray-300 bg-white/90 backdrop-blur-sm text-sm ${
              errors.user ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
            }`}
            required
          />
          {errors.user && (
            <p className="text-red-500 text-xs mt-1">{errors.user}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10 text-sm">
            📧
          </div>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="Your Email Address"
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 hover:border-gray-300 bg-white/90 backdrop-blur-sm text-sm ${
              errors.customerEmail ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
            }`}
            required
          />
          {errors.customerEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10 text-sm">
            📱
          </div>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="10-digit Mobile Number"
            maxLength="10"
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 hover:border-gray-300 bg-white/90 backdrop-blur-sm text-sm ${
              errors.contactNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
            }`}
            required
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
          )}
        </div>

        {/* Destination Field */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10 text-sm">
            📍
          </div>
          <select
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 hover:border-gray-300 bg-white/90 backdrop-blur-sm appearance-none cursor-pointer text-sm ${
              errors.destination ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
            }`}
            required
          >
            <option value="">Select Your Destination</option>
            {destinations.map((dest) => (
              <option key={dest.value} value={dest.value}>
                {dest.label} - ₹{dest.price.toLocaleString()}/person
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {errors.destination && (
            <p className="text-red-500 text-xs mt-1">{errors.destination}</p>
          )}
        </div>

        {/* Travel Date Field */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors text-sm">
            📅
          </div>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={getTodayDate()}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 hover:border-gray-300 bg-white/90 backdrop-blur-sm text-sm ${
              errors.date ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
            }`}
            required
          />
          {errors.date && (
            <p className="text-red-500 text-xs mt-1">{errors.date}</p>
          )}
        </div>

        {/* Number of People Field */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors text-sm">
            👥
          </div>
          <select
            name="people"
            value={formData.people}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 hover:border-gray-300 bg-white/90 backdrop-blur-sm appearance-none cursor-pointer text-sm ${
              errors.people ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
            }`}
            required
          >
            {[...Array(20)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i + 1 === 1 ? 'Person' : 'People'}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {errors.people && (
            <p className="text-red-500 text-xs mt-1">{errors.people}</p>
          )}
        </div>

        {/* Total Amount Display */}
        {formData.totalAmount > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800">Total Amount:</span>
              <span className="text-lg font-bold text-blue-900">
                ₹{formData.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {formData.people} {formData.people === 1 ? 'person' : 'people'} × ₹{(formData.totalAmount / formData.people).toLocaleString()}/person
            </div>
          </div>
        )}

        {/* Special Requests Field */}
        <div className="relative group">
          <div className="absolute left-3 top-4 text-gray-400 group-focus-within:text-orange-500 transition-colors text-sm">
            💬
          </div>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requests or preferences?"
            rows="3"
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all duration-300 hover:border-gray-300 bg-white/90 backdrop-blur-sm resize-none text-sm"
            maxLength="500"
          />
          {formData.specialRequests && (
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formData.specialRequests.length}/500 characters
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 mt-6"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Continue to Payment</span>
              <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </>
          )}
        </button>

        {/* Additional Info */}
        <div className="text-center text-xs text-gray-600 bg-blue-50 p-3 rounded-lg mt-4">
          <p className="flex items-center justify-center space-x-2">
            <span>🔒</span>
            <span>Your booking will be confirmed and you'll receive a reference ID via email.</span>
          </p>
        </div>
      </form>

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
    </>
  );
};

export default BookingForm;