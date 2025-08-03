import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    upiId: '',
    bankAccount: '',
    ifscCode: ''
  });

  // Get booking data from navigation state
  const bookingData = location.state?.bookingData;
  const userEmail = location.state?.userEmail;

  useEffect(() => {
    // Redirect if no booking data
    if (!bookingData) {
      navigate('/book');
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bookingData, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formatted.replace(/\s/g, '').length <= 16) {
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
      if (formatted.length <= 5) {
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
      return;
    }
    
    // Limit CVV to 3-4 digits
    if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      const { cardNumber, expiryDate, cvv, cardholderName } = formData;
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit card number');
        return false;
      }
      if (!expiryDate || expiryDate.length !== 5) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (!cvv || cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return false;
      }
      if (!cardholderName.trim()) {
        toast.error('Please enter the cardholder name');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!formData.upiId.trim()) {
        toast.error('Please enter your UPI ID');
        return false;
      }
      if (!formData.upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID');
        return false;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!formData.bankAccount.trim() || !formData.ifscCode.trim()) {
        toast.error('Please enter valid bank details');
        return false;
      }
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validatePayment()) return;
    
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically integrate with a real payment gateway
      const paymentResponse = {
        success: true,
        transactionId: `TXN${Date.now()}`,
        amount: bookingData.totalAmount,
        method: paymentMethod
      };

      if (paymentResponse.success) {
        // Update booking status to confirmed
        const updateResponse = await fetch(`http://localhost:5000/api/bookings/${bookingData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'confirmed',
            paymentStatus: 'completed',
            transactionId: paymentResponse.transactionId
          }),
        });

        if (updateResponse.ok) {
          toast.success('Payment successful! Booking confirmed.', {
            position: "top-center",
            autoClose: 3000,
          });
          
          // Redirect to success page or home after delay
          setTimeout(() => {
            navigate('/', { 
              state: { 
                paymentSuccess: true, 
                bookingId: bookingData._id,
                transactionId: paymentResponse.transactionId
              } 
            });
          }, 3000);
        } else {
          throw new Error('Failed to update booking status');
        }
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.', {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToBooking = () => {
    navigate('/book');
  };

  if (!bookingData) {
    return null; // Will redirect in useEffect
  }

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
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/10 backdrop-blur-md'
      }`}>
        <div className="w-full px-6">
          <div className="max-w-7xl mx-auto">
            <nav className="flex justify-between items-center py-4">
              <button
                onClick={() => navigate('/')}
                className={`text-3xl font-bold transition-colors ${
                  isScrolled ? 'text-blue-700 hover:text-orange-500' : 'text-white hover:text-orange-300'
                }`}
              >
                WanderWise
              </button>
              <ul className="hidden md:flex space-x-8">
                <li>
                  <button
                    onClick={handleBackToBooking}
                    className={`font-medium transition-colors ${
                      isScrolled ? 'text-blue-700 hover:text-orange-500' : 'text-white hover:text-orange-300'
                    }`}
                  >
                    Back to Booking
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Booking Summary */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-2xl h-fit">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Booking Summary
              </h2>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-semibold text-blue-700">{bookingData.referenceId}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-semibold text-blue-700">{bookingData.destination}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Travel Date:</span>
                  <span className="font-semibold text-blue-700">
                    {new Date(bookingData.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Travelers:</span>
                  <span className="font-semibold text-blue-700">
                    {bookingData.people} {bookingData.people === 1 ? 'Person' : 'People'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-blue-700 text-sm">{userEmail}</span>
                </div>
                
                {bookingData.specialRequests && (
                  <div className="border-b border-gray-200 pb-2">
                    <span className="text-gray-600 block mb-1">Special Requests:</span>
                    <span className="font-semibold text-blue-700 text-sm">
                      {bookingData.specialRequests}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-lg font-bold pt-2">
                  <span className="text-gray-800">Total Amount:</span>
                  <span className="text-green-600">₹{bookingData.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Complete Payment
              </h2>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Method</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'card', label: '💳 Card', name: 'Credit/Debit Card' },
                      { id: 'upi', label: '📱 UPI', name: 'UPI Payment' },
                      { id: 'netbanking', label: '🏦 Bank', name: 'Net Banking' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          paymentMethod === method.id
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg mb-1">{method.label}</div>
                        <div className="text-xs">{method.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handlePayment} className="space-y-4">
                  {paymentMethod === 'card' && (
                    <>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                          required
                        />
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                          Card Number
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                            required
                          />
                          <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                            Expiry Date
                          </label>
                        </div>
                        
                        <div className="relative">
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                            required
                          />
                          <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                            CVV
                          </label>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          name="cardholderName"
                          value={formData.cardholderName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                          required
                        />
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                          Cardholder Name
                        </label>
                      </div>
                    </>
                  )}
                  
                  {paymentMethod === 'upi' && (
                    <div className="relative">
                      <input
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        placeholder="yourname@upi"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                        required
                      />
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                        UPI ID
                      </label>
                    </div>
                  )}
                  
                  {paymentMethod === 'netbanking' && (
                    <>
                      <div className="relative">
                        <input
                          type="text"
                          name="bankAccount"
                          value={formData.bankAccount}
                          onChange={handleInputChange}
                          placeholder="Account Number"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                          required
                        />
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                          Account Number
                        </label>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          name="ifscCode"
                          value={formData.ifscCode}
                          onChange={handleInputChange}
                          placeholder="IFSC Code"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all"
                          required
                        />
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                          IFSC Code
                        </label>
                      </div>
                    </>
                  )}

                  {/* Payment Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 mt-6"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ₹{bookingData.totalAmount?.toLocaleString()}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Security Notice */}
                  <div className="text-center text-xs text-gray-600 bg-green-50 p-3 rounded-lg mt-4">
                    <p className="flex items-center justify-center space-x-2">
                      <span>🔒</span>
                      <span>Your payment is secured with 256-bit SSL encryption</span>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer
        position="top-center"
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

      {/* CSS Animations */}
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

export default PaymentPage;