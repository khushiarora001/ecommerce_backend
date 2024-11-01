const mongoose = require('mongoose');
const bodyParser = require('body-parser');
console.log('Current working directory:', __dirname);
console.log('Trying to require routes/auth from:', require.resolve('./routes/auth'));
const authRoutes = require('./routes/auth'); // Check this line

const authRoutes = require('routes/auth');

const productRoutes = require('routes/product');
const cartRoutes = require('routes/cart');
const authenticateToken = require('middleware/auths');
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key_here',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Connect to MongoDB
mongoose.connect("mongodb+srv://khushi:hj6fbkKQzZsYuTfF@ecommerce.lbqs8.mongodb.net/?retryWrites=true&w=majority&appName=ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products/search', productRoutes);
app.use('/api/cart', authenticateToken, cartRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
