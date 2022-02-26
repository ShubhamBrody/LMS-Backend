const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    email: String,
    name: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String,
    isbn: String,
    bookReturnDate: Date,
    bookReturned: Boolean,
    bookReturnedDate: Date,
    reorder: Boolean,
})

module.exports = mongoose.model('Booking', bookingSchema, 'LMS-Bookings');