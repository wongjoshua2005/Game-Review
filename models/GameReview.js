const mongoose = require("mongoose");

const gameReviewSchema = new mongoose.Schema({
   name: {
      type: String
   },
   email: {
      type: String
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
