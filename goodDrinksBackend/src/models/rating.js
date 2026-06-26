const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    wine: { type: mongoose.Schema.Types.ObjectId, ref: 'wine', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: {type: String }
});

const Rating = mongoose.model('Rating', RatingSchema);
module.exports = Rating;


