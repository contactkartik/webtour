// test-backend.js - Run this to test your backend
const testBackend = async () => {
  console.log('🧪 Testing WanderWise Backend...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData.message);
    console.log('📊 Status:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    console.log('💡 Make sure your backend server is running: node server.js');
    return;
  }

  console.log('\n2️⃣ Testing API documentation endpoint...');
  try {
    const apiResponse = await fetch('http://localhost:5000/api');
    const apiData = await apiResponse.json();
    console.log('✅ API docs available');
    console.log('📚 Available endpoints:', Object.keys(apiData.endpoints));
  } catch (error) {
    console.log('❌ API docs failed:', error.message);
  }

  // Test 2: Test Booking Creation
  console.log('\n3️⃣ Testing booking creation...');
  const testBookingData = {
    user: 'Test User',
    customerEmail: 'test@example.com',
    contactNumber: '9876543210',
    destination: 'Agra',
    date: '2025-08-15',
    people: 2,
    totalAmount: 24000,
    specialRequests: 'Test booking from script'
  };

  try {
    console.log('📤 Sending booking data:', testBookingData);
    
    const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBookingData),
    });

    console.log('📡 Response status:', bookingResponse.status);
    
    const responseText = await bookingResponse.text();
    console.log('📄 Raw response:', responseText);
    
    const bookingData = JSON.parse(responseText);
    
    if (bookingResponse.ok && bookingData.success) {
      console.log('✅ Booking creation successful!');
      console.log('🎫 Booking reference:', bookingData.data.bookingReference || bookingData.data.id);
      console.log('📧 Email will be sent to:', bookingData.data.customerEmail);
      console.log('📊 Full booking data:', bookingData.data);
    } else {
      console.log('❌ Booking creation failed');
      console.log('🔍 Error details:', bookingData);
      
      if (bookingData.errors) {
        console.log('📝 Validation errors:');
        bookingData.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Booking test failed:', error.message);
    console.log('💡 Check if your backend accepts the correct field names');
  }

  console.log('\n4️⃣ Testing CORS configuration...');
  try {
    const corsResponse = await fetch('http://localhost:5000/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({ test: 'cors test' }),
    });
    
    if (corsResponse.ok) {
      console.log('✅ CORS configuration working');
    } else {
      console.log('⚠️ CORS might have issues, status:', corsResponse.status);
    }
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
  }

  console.log('\n🏁 Backend test completed!');
  console.log('\n💡 Next steps:');
  console.log('1. If health check failed: Start your backend server');
  console.log('2. If booking failed: Check field names and validation');
  console.log('3. If CORS failed: Check CORS configuration in server.js');
  console.log('4. Test your React form now!');
};

// For Node.js environment
if (typeof require !== 'undefined' && require.main === module) {
  // Install node-fetch first: npm install node-fetch@2
  const fetch = require('node-fetch');
  testBackend();
}

// For browser environment (copy this into browser console)
if (typeof window !== 'undefined') {
  testBackend();
}

// Export for other files
if (typeof module !== 'undefined') {
  module.exports = testBackend;
}