// routes/cart.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('middleware/auths');
const Cart = require('models/Cart');
const Product = require('models/product');

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    try {
        let cart = await Cart.findOne({ userId });

        if (cart) {
            const productIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            if (productIndex > -1) {
                cart.items[productIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity });
            }
        } else {
            cart = new Cart({
                userId,
                items: [{ productId, quantity }]
            });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get cart items
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from the token

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
