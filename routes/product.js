const express = require('express');
const router = express.Router();
const Product = require('./models/product');

// Create a new product
router.post('/create', async (req, res) => {
    console.log('Search endpoint hit');
    const { name, description, price, category, imageUrl } = req.body;
    try {
        const newProduct = new Product({ name, description, price, category, imageUrl });
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Get a single product by ID
// router.get('/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const product = await Product.findById(id);
//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }
//         res.status(200).json(product);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error', error: err });
//     }
// });

// Update a product by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, imageUrl } = req.body;
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { name, description, price, category, imageUrl },
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Delete a product by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});
router.get('/search', async (req, res) => {
    try {
        console.log('Search endpoint hit'); // Log to confirm route hit
        const query = req.query.q;
        console.log('Search query:', query); // Log the search query

        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }

        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        });

        console.log('Products found:', products); // Log the results
        res.json(products);
    } catch (error) {
        console.error('Search error:', error); // Log the error
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
