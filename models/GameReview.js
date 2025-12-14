const mongoose = require("mongoose");

const gameReviewSchema = new mongoose.Schema({
    email: {
       type: String
    },
    name: {
        type: String,
        required: true
    },
    rating: {
       type: Number,
       required: true
    },
    review: {
       type: String
    }
});

const GameReview = mongoose.model("GameReview", gameReviewSchema);
module.exports = GameReview;
