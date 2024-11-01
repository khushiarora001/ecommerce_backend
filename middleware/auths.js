const jwt = require('jsonwebtoken');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_secret_key_here';

function authenticateToken(req, res, next) {
    const token = req.cookies.token; // Extract token from cookies
    if (!token) return res.status(403).json({ message: 'Access denied' });

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
