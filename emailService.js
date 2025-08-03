// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter with better error handling
const createTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
  }
};

// Send booking confirmation email to customer
const sendBookingConfirmation = async (bookingDetails) => {
  try {
    console.log('Attempting to send booking confirmation email...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured');
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    
    const { 
      customerEmail, 
      customerName, 
      destination, 
      date, 
      travelers, 
      totalAmount, 
      bookingReference, 
      contactNumber,
      specialRequests,
      formattedDate 
    } = bookingDetails;
    
    const mailOptions = {
      from: {
        name: 'WanderWise Travel',
        address: process.env.EMAIL_USER
      },
      to: customerEmail,
      subject: `🌟 Your WanderWise Adventure is Confirmed! - ${bookingReference}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #667eea; margin: 0; font-size: 28px; font-weight: bold;">🎉 Booking Confirmed!</h1>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your adventure with WanderWise awaits!</p>
            </div>
            
            <!-- Greeting -->
            <div style="margin-bottom: 25px;">
              <h2 style="color: #333; margin: 0 0 15px 0; font-size: 22px;">Dear ${customerName},</h2>
              <p style="color: #555; line-height: 1.6; margin: 0; font-size: 16px;">
                Thank you for choosing WanderWise for your travel adventure! Your booking has been successfully confirmed. 
                Get ready for an unforgettable experience in <strong>${destination}</strong>! ✈️
              </p>
            </div>
            
            <!-- Booking Details Card -->
            <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">🎫</span> Trip Details
              </h3>
              
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: 600; color: #555;">🏝️ Destination:</span>
                  <span style="color: #333; font-weight: 500;">${destination}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: 600; color: #555;">📅 Travel Date:</span>
                  <span style="color: #333; font-weight: 500;">${formattedDate}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: 600; color: #555;">👥 Travelers:</span>
                  <span style="color: #333; font-weight: 500;">${travelers} ${travelers === 1 ? 'person' : 'people'}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: 600; color: #555;">💰 Total Amount:</span>
                  <span style="color: #667eea; font-weight: 700; font-size: 18px;">₹${totalAmount.toLocaleString('en-IN')}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: 600; color: #555;">🎫 Booking Ref:</span>
                  <span style="color: #333; font-weight: 500; font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">${bookingReference}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #555;">📞 Contact:</span>
                  <span style="color: #333; font-weight: 500;">${contactNumber}</span>
                </div>
              </div>
              
              ${specialRequests ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                  <p style="margin: 0; color: #555;"><strong>📝 Special Requests:</strong></p>
                  <p style="margin: 5px 0 0 0; color: #333; font-style: italic;">${specialRequests}</p>
                </div>
              ` : ''}
            </div>
            
            <!-- Payment Information -->
            <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #2e7d32; margin: 0 0 10px 0; display: flex; align-items: center;">
                <span style="margin-right: 8px;">💳</span> Next Steps
              </h4>
              <p style="color: #2e7d32; margin: 0; line-height: 1.6;">
                Your booking is confirmed! Please complete the payment process to secure your reservation. 
                You will receive a payment link shortly or you can access it from your booking dashboard.
              </p>
            </div>
            
            <!-- Important Information -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0; display: flex; align-items: center;">
                <span style="margin-right: 8px;">⚠️</span> Important Information
              </h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Please carry a valid ID proof during your travel</li>
                <li>Arrive at the meeting point 30 minutes before departure</li>
                <li>Check weather conditions before your travel date</li>
                <li>Contact us for any changes at least 24 hours in advance</li>
              </ul>
            </div>
            
            <!-- Contact Information -->
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
              <h4 style="color: #333; margin: 0 0 15px 0;">Need Help? We're Here for You!</h4>
              <p style="color: #666; margin: 0; line-height: 1.6;">
                For any queries or assistance, feel free to contact our support team:<br>
                📧 Email: support@wanderwise.com<br>
                📞 Phone: +91-XXX-XXX-XXXX<br>
                🕒 Available 24/7 for your convenience
              </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
              <p style="color: #667eea; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">
                Happy Travels! 🌍✨
              </p>
              <p style="color: #888; font-size: 14px; margin: 0;">
                Thank you for choosing WanderWise<br>
                Making your travel dreams come true, one adventure at a time
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking notification to WanderWise team
const sendBookingNotification = async (bookingDetails) => {
  try {
    console.log('Attempting to send booking notification to team...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured');
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    
    const { 
      customerEmail, 
      customerName, 
      destination, 
      date, 
      travelers, 
      totalAmount, 
      bookingReference, 
      contactNumber,
      specialRequests,
      formattedDate 
    } = bookingDetails;
    
    const teamEmail = process.env.WANDERWISE_EMAIL || process.env.EMAIL_USER;
    
    const mailOptions = {
      from: {
        name: 'WanderWise System',
        address: process.env.EMAIL_USER
      },
      to: teamEmail,
      subject: `🚨 New Booking Alert - ${destination} - ${bookingReference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f; text-align: center; background: #ffebee; padding: 20px; margin: 0; border-radius: 8px 8px 0 0;">
            🎉 New WanderWise Booking!
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #333; margin: 0 0 20px 0;">New travel booking received:</h3>
            
            <!-- Customer Details -->
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2196F3;">
              <h4 style="color: #333; margin: 0 0 10px 0;">👤 Customer Details:</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="padding: 5px 0;"><strong>Name:</strong> ${customerName}</li>
                <li style="padding: 5px 0;"><strong>Email:</strong> ${customerEmail}</li>
                <li style="padding: 5px 0;"><strong>Contact:</strong> ${contactNumber}</li>
              </ul>
            </div>
            
            <!-- Booking Details -->
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4CAF50;">
              <h4 style="color: #333; margin: 0 0 10px 0;">🎫 Trip Details:</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="padding: 5px 0;"><strong>Destination:</strong> ${destination}</li>
                <li style="padding: 5px 0;"><strong>Travel Date:</strong> ${formattedDate}</li>
                <li style="padding: 5px 0;"><strong>Travelers:</strong> ${travelers} ${travelers === 1 ? 'person' : 'people'}</li>
                <li style="padding: 5px 0;"><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</li>
                <li style="padding: 5px 0;"><strong>Booking Reference:</strong> <code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">${bookingReference}</code></li>
                <li style="padding: 5px 0;"><strong>Booking Time:</strong> ${new Date().toLocaleString('en-IN')}</li>
              </ul>
              
              ${specialRequests ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                  <strong>Special Requests:</strong><br>
                  <em style="color: #666;">${specialRequests}</em>
                </div>
              ` : ''}
            </div>
            
            <!-- Action Required -->
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ff9800;">
              <h4 style="color: #ef6c00; margin: 0 0 10px 0;">⚡ Action Required:</h4>
              <ul style="color: #ef6c00; margin: 0; padding-left: 20px;">
                <li>Review and confirm the booking details</li>
                <li>Prepare travel itinerary and arrangements</li>
                <li>Contact customer if needed for clarifications</li>
                <li>Update booking status in the system</li>
                <li>Send payment link to customer if not automated</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 5px;">
              <p style="margin: 0; color: #1976d2; font-weight: 600;">
                🚀 Customer confirmation email has been sent automatically
              </p>
            </div>
            
            <p style="color: #666; text-align: center; margin: 20px 0;">
              Please process this booking promptly and ensure all arrangements are in place.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Booking notification email sent to team successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending booking notification email:', error);
    return { success: false, error: error.message };
  }
};

// Send cancellation email
const sendCancellationEmail = async (bookingDetails) => {
  try {
    console.log('Attempting to send cancellation email...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured');
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    
    const { 
      customerEmail, 
      customerName, 
      destination, 
      date, 
      bookingReference, 
      formattedDate 
    } = bookingDetails;
    
    const mailOptions = {
      from: {
        name: 'WanderWise Travel',
        address: process.env.EMAIL_USER
      },
      to: customerEmail,
      subject: `❌ Booking Cancellation Confirmed - ${bookingReference}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f; text-align: center;">Booking Cancelled</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333;">Dear ${customerName},</h3>
            <p>Your WanderWise booking has been successfully cancelled as requested.</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d32f2f;">
              <h4 style="color: #333; margin-top: 0;">Cancelled Trip Details:</h4>
              <ul style="list-style: none; padding: 0;">
                <li style="padding: 5px 0;"><strong>🏝️ Destination:</strong> ${destination}</li>
                <li style="padding: 5px 0;"><strong>📅 Travel Date:</strong> ${formattedDate}</li>
                <li style="padding: 5px 0;"><strong>🎫 Booking Reference:</strong> ${bookingReference}</li>
              </ul>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #1976d2; margin-top: 0;">💳 Refund Information:</h4>
              <p style="color: #666; margin: 5px 0;">
                Your refund will be processed according to our cancellation policy. 
                You will receive the refund amount in your original payment method within 5-7 business days.
              </p>
            </div>
            
            <p style="color: #666;">
              We're sorry to see your travel plans change. We hope to serve you again in the future for your next adventure!
            </p>
            
            <div style="text-align: center; margin: 20px 0;">
              <p style="color: #888; font-size: 14px;">
                Thank you for choosing WanderWise<br>
                The WanderWise Team 🌍
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Cancellation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
    return { success: false, error: error.message };
  }
};

// Send travel reminder email (for bookings 7 days before travel)
const sendTravelReminder = async (bookingDetails) => {
  try {
    console.log('Attempting to send travel reminder email...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured');
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    
    const { 
      customerEmail, 
      customerName, 
      destination, 
      date, 
      travelers, 
      bookingReference, 
      daysUntilTravel,
      formattedDate 
    } = bookingDetails;
    
    const mailOptions = {
      from: {
        name: 'WanderWise Travel',
        address: process.env.EMAIL_USER
      },
      to: customerEmail,
      subject: `🎒 Get Ready! Your ${destination} Adventure is in ${daysUntilTravel} days!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50; text-align: center;">🎉 Adventure Alert!</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333;">Dear ${customerName},</h3>
            <p>Your exciting trip to <strong>${destination}</strong> is just <strong>${daysUntilTravel} days</strong> away! 🎒✈️</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4 style="color: #333; margin-top: 0;">📋 Pre-Travel Checklist:</h4>
              <ul style="color: #666;">
                <li>✅ Confirm your travel documents are ready</li>
                <li>✅ Check weather forecast for ${destination}</li>
                <li>✅ Pack according to the destination and activities</li>
                <li>✅ Arrive at meeting point 30 minutes early</li>
                <li>✅ Keep emergency contacts handy</li>
              </ul>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 0; color: #2e7d32;">
                <strong>Booking Reference:</strong> ${bookingReference}<br>
                <strong>Travel Date:</strong> ${formattedDate}<br>
                <strong>Travelers:</strong> ${travelers} ${travelers === 1 ? 'person' : 'people'}
              </p>
            </div>
            
            <p style="color: #666;">
              We're excited to make your journey memorable! Safe travels! 🌟
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Travel reminder email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending travel reminder email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    console.log('Testing email configuration...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { 
        success: false, 
        error: 'Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file' 
      };
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return { 
      success: false, 
      error: error.message,
      suggestion: 'Please check your EMAIL_USER and EMAIL_PASS in .env file. For Gmail, use App Password instead of regular password.'
    };
  }
};

// Send test email
const sendTestEmail = async (toEmail = process.env.EMAIL_USER) => {
  try {
    console.log('Sending test email to:', toEmail);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { success: false, error: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'WanderWise Travel',
        address: process.env.EMAIL_USER
      },
      to: toEmail,
      subject: '✅ WanderWise Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50; text-align: center;">🎉 Email Service Working!</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333;">WanderWise Email Service Test</h3>
            <p>This is a test email to verify that the WanderWise email service is working correctly.</p>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 0; color: #2e7d32;">
                <strong>✅ Email Configuration:</strong> Working<br>
                <strong>📅 Test Date:</strong> ${new Date().toLocaleString('en-IN')}<br>
                <strong>🔧 Environment:</strong> ${process.env.NODE_ENV || 'development'}
              </p>
            </div>
            
            <p style="color: #666;">
              If you received this email, your WanderWise email service is configured correctly! 🌟
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId, message: 'Test email sent successfully' };
    
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingNotification,
  sendCancellationEmail,
  sendTravelReminder,
  testEmailConfig,
  sendTestEmail
};