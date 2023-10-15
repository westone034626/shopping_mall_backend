const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxLength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        minLength: 5
    },
    role: {
        type: Number,
        default: 0
    },
    image: String
});

userSchema.pre('save', async function (next) {
    let user = this;

    if (user.isModified('password')) {
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(user.password, salt);

        user.password = hash;
    }

    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;