const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authenticateToken = require('../middleware/auths');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_secret_key_here';

// Sign up route
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        // Define the payload
        const payload = {
            id: user._id,
            username: user.username
        };

        // Generate an access token
        const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
            expiresIn: '1y'  // Token valid for 1 year
        });

        res.status(201).json({
            message: 'User registered successfully',
            accessToken
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid username or password' });

        // Compare the provided password with the stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Invalid username or password' });

        // Generate an access token
        const accessToken = jwt.sign({ id: user._id, username: user.username }, ACCESS_TOKEN_SECRET, {
            expiresIn: '1y' // Token valid for 1 year
        });

        // Set the token as a cookie
        res.cookie('token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Store the token in session
        req.session.token = accessToken;

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Fetch user details route
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ username: user.username });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
