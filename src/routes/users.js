const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.get('/auth', auth, async (req, res, next) => {
    return res.json({
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        image: req.user.image,
        cart: req.user.cart,
        history: req.user.history,
    });
});

router.post('/register', async (req, res, next) => {
    try {
        const user = new User(req.body);
        await user.save();

        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).send("Auth failed, email not found");
        }

        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) {
            res.status(400).send('Wrong password');
        }

        const payload = {
            userId: user._id.toHexString()
        };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.json({ user, accessToken });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', auth, async (req, res, next) => {
    try {
        return res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

module.exports = router;