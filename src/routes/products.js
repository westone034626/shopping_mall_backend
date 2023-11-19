const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');

router.post('/', auth, async (req, res, next) => {
    try {
        const post = new Product(req.body);
        await post.save();

        return res.sendStatus(201);
    } catch (error) {
        next(error);
    }
});

module.exports = router;