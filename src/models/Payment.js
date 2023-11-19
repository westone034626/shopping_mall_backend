const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    user: {
        type: Object
    },
    data: {
        type: Array,
        default: [],
    },
    product: {
        type: Array,
        defualt: [],
    },
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;