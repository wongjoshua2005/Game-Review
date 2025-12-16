const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/review", (req, res) => {
    res.render("review", {
        destination: "/processReview"
    });
});

router.get("/listOfReviews", (req, res) => {
    res.render("listReviews");
});

module.exports = router;