const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const seedData = require('./config/seed');

// Load env variables
dotenv.config();

// Connect to database
connectDB().then(() => {
  // Seed initial mock database content
  seedData();
});

const app = express();

// Middlewares
app.use(cors());

// Stripe webhook requires raw body parsing, register before express.json()
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').handleWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload folders (for local uploads fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mapping
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/fooditems', require('./routes/foodItemRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Basic health check route
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'Food GenAI MERN Backend Service is Running.' });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error occurred',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
