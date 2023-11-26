const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const async = require('async');

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

router.post('/cart', auth, async (req, res, next) => {
    try {
        // User collection에 해당 유저의 정보를 가져오기.
        const userInfo = await User.findOne({ _id: req.user._id });

        // 가져온 정보에서 카트에다 넣으려는 상품이 이미 존재하는지 확인
        let duplicated = false;
        userInfo.cart.forEach(item => {
            if (req.body.productId === item.id) {
                duplicated = true;
            }
        });

        // 상품이 있을 때
        if (duplicated) {
            const user = await User.findOneAndUpdate(
                { _id: req.user._id, "cart.id": req.body.productId },
                { $inc: { "cart.$.quantity": 1 } },
                { new: true }
            );

            return res.status(201).send(user.cart);
        }
        // 새로운 상품이 추가되는 경우
        else {
            const user = await User.findOneAndUpdate(
                { _id: req.user._id },
                {
                    $push: {
                        cart: {
                            id: req.body.productId,
                            quantity: 1,
                            date: Date.now(),
                        }
                    }
                },
                { new: true }
            );

            return res.status(201).send(user.cart);
        }
    } catch (error) {
        next(error);
    }
});

router.delete('/cart', auth, async (req, res, next) => {
    try {
        const userInfo = await User.findOneAndUpdate(
            { _id: req.user._id },
            {
                "$pull": {
                    "cart": {
                        "id": req.query.productId,
                    }
                }
            },
            { new: true }
        );

        const cart = userInfo.cart;
        const array = cart.map(item => item.id);

        const productInfo = await Product
            .find({ _id: { $in: array } })
            .populate('writer');

        return res.json({
            productInfo,
            cart
        });
    } catch (error) {
        next(error);
    }
});

router.post('/payment', auth, async (req, res, next) => {
    let history = [];
    let transactionData = {};

    req.body.cartDetail.forEach(item => {
        history.push({
            dateOfPurchase: new Date().toISOString(),
            name: item.title,
            id: item._id,
            price: item.price,
            quantity: item.quantity,
            paymentId: crypto.randomBytes(20).toString('hex'),
        });
    });

    transactionData.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,

    };

    transactionData.product = history;

    await User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { history: { $each: history } }, $set: { cart: [] } },
    );

    const payment = new Payment(transactionData);
    const paymentDocs = await payment.save();

    let products = [];
    paymentDocs.product.forEach(item => {
        products.push({ id: item.id, quantity: item.quantity });
    });

    async.eachSeries(
        products,
        async (item) => {
            await Product.updateOne(
                { _id: item.id },
                {
                    $inc: {
                        "sold": item.quantity,
                    }
                }
            );
        },
        (err) => {
            if (err) return res.status(500).send(err);
            return res.sendStatus(200);
        }
    );
});

module.exports = router;