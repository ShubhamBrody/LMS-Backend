const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    securitykey: String,
    booksBorrowed: Array,
    booksBorrowedCount: Number,
    booksBorrowedLimit: Number,
    booksBorrowedLimitReached: Boolean,
});

module.exports = mongoose.model('Users', userSchema, 'LMS-user');