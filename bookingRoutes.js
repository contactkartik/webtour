// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // Import your Booking model

// Validation middleware
const validateBooking = (req, res, next) => {
  const { user, customerEmail, contactNumber, destination, date, people, totalAmount } = req.body;
  
  console.log('Validating phone:', contactNumber, '-> cleaned:', contactNumber?.replace(/[\s\-\(\)]/g, ''));
  console.log('Validating date:', date, typeof date);
  console.log('Validating people:', people, typeof people);
  console.log('Validating totalAmount:', totalAmount, typeof totalAmount);
  
  const errors = [];
  
  if (!user || user.trim().length < 2) {
    errors.push('User name must be at least 2 characters long');
  }
  
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    errors.push('Valid email address is required');
  }
  
  if (!contactNumber) {
    errors.push('Contact number is required');
  }
  
  if (!destination || destination.trim().length < 2) {
    errors.push('Destination must be at least 2 characters long');
  }
  
  if (!date) {
    errors.push('Travel date is required');
  } else {
    const travelDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(travelDate.getTime())) {
      errors.push('Invalid date format');
    } else if (travelDate < today) {
      errors.push('Travel date cannot be in the past');
    }
  }
  
  if (!people || !Number.isInteger(Number(people)) || Number(people) < 1 || Number(people) > 20) {
    errors.push('Number of people must be between 1 and 20');
  }
  
  if (!totalAmount || Number(totalAmount) < 0) {
    errors.push('Total amount must be a positive number');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

// GET /api/bookings - Get all bookings
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all bookings...');
    
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.paymentStatus = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { user: new RegExp(search, 'i') },
        { destination: new RegExp(search, 'i') },
        { bookingReference: new RegExp(search, 'i') },
        { customerEmail: new RegExp(search, 'i') }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Booking.countDocuments(query)
    ]);

    console.log(`📋 Found ${bookings.length} bookings out of ${total} total`);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/bookings/:id - Get booking by ID  
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching booking by ID: ${id}`);

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log(`✅ Found booking: ${booking.bookingReference}`);

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/bookings/reference/:reference - Get booking by reference
router.get('/reference/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    console.log(`🔍 Fetching booking by reference: ${reference}`);

    const booking = await Booking.findOne({ bookingReference: reference.toUpperCase() });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log(`✅ Found booking: ${booking.bookingReference}`);

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('❌ Error fetching booking by reference:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/bookings - Create new booking
router.post('/', validateBooking, async (req, res) => {
  try {
    console.log('📝 Creating new booking...');
    console.log('Booking request body:', req.body);

    // Create new booking with additional metadata
    const bookingData = {
      ...req.body,
      source: 'website',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const booking = new Booking(bookingData);
    
    // Save the booking
    const savedBooking = await booking.save();

    console.log(`✅ Booking created successfully: ${savedBooking.bookingReference}`);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: savedBooking.getEmailData(),
        bookingReference: savedBooking.bookingReference,
        paymentUrl: savedBooking.getPaymentUrl()
      }
    });

  } catch (error) {
    console.error('❌ Error creating booking:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Booking with this reference already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/bookings/:id/status - Update booking status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, bookingStatus } = req.body;
    
    console.log(`✏️ Updating booking status: ${id}`);

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update status fields
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (bookingStatus) booking.bookingStatus = bookingStatus;

    const updatedBooking = await booking.save();

    console.log(`✅ Booking status updated: ${updatedBooking.bookingReference}`);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('❌ Error updating booking status:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Cancelling booking: ${id}`);

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be cancelled (travel date too close or already processed)'
      });
    }

    // Update booking status instead of deleting
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'cancelled';
    await booking.save();

    console.log(`✅ Booking cancelled: ${booking.bookingReference}`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (error) {
    console.error('❌ Error cancelling booking:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/bookings/test-validation - Test validation endpoint
router.post('/test-validation', validateBooking, (req, res) => {
  res.json({
    success: true,
    message: 'Validation passed',
    data: req.body
  });
});

module.exports = router;