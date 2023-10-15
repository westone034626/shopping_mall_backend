const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res, next) => {
    try {
        const user = new User(req.body);
        await user.save();

        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});

module.exports = router;