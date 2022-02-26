const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    securitykey: String,
});


module.exports = mongoose.model('Admin', adminSchema, 'LMS-admin');