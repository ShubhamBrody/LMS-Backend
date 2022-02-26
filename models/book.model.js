const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const bookSchema = new mongoose.Schema({
    bookName: String,
    authorName: String,
    description: String,
    shortDescription: String,
    isbn: String,
    genre: String,
    base64BookImage: String,
    base64AuthorImage: String,
    rating: Number, 
    originalQuantity: {type : Number},
    currentQuantity: {type : Number},
});

bookSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Books', bookSchema, 'LMS-book');