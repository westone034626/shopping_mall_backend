const express = require('express');
const multer = require('multer');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage }).single('file');

router.get('/', async (req, res, next) => {
    const order = req.query.order ?? 'desc';
    const sortBy = req.query.sortBy ?? '_id';
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const skip = req.query.skip ? Number(req.query.skip) : 0;

    let findArgs = {};
    for (let key in req.query.filters) {
        if (req.query.filters[key].length > 0) {
            if (key === 'price') {
                findArgs[key] = {
                    $gte: req.query.filters[key][0],
                    $lte: req.query.filters[key][1],
                };
            } else if (key === 'searchTerm') {
                findArgs['$text'] = { '$search': req.query.filters[key] };
            } else {
                findArgs[key] = req.query.filters[key];
            }
        }
    }

    try {
        const products = await Product.find(findArgs)
            .populate('writer')
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit);

        const productsTotal = await Product.countDocuments(findArgs);
        const hasMore = skip + limit < productsTotal ? true : false;

        return res.status(200).json({
            products,
            hasMore,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    const type = req.query.type;

    const productIds = type === 'array'
        ? req.params.id.split(',')
        : req.params.id;

    // productId를 이용해서 DB에서 productId와 같은 product 정보를 가져옵니다.
    try {
        const product = await Product
            .find({ _id: { $in: productIds } })
            .populate('writer');

        return res.status(200).send(product);
    } catch (error) {
        next(error);
    }
});

router.post('/', auth, async (req, res, next) => {
    try {
        const post = new Product(req.body);
        await post.save();

        return res.sendStatus(201);
    } catch (error) {
        next(error);
    }
});

router.post('/image', auth, async (req, res, next) => {
    try {
        upload(req, res, (err) => {
            if (err) {
                return req.status(500).send(err);
            }
            return res.json({ fileName: res.req.file.filename });
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;