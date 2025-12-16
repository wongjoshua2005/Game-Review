// To initialize the Express
const express = require("express");   /* Accessing express module */
const app = express();  /* app is a request handler function */

// To initialize for MongoDB
const path = require("path");

// To initialize Mongoose
const mongoose = require("mongoose");

// Standard initialization for the port number and reading the apps
const bodyParser = require("body-parser");

// To install HTTP Client for the API
const axios = require("axios");

const portNumber = 3000;
const httpSuccessStatus = 200;

// To Continue Initialize MongoDB
require("dotenv").config({
    path: path.resolve(__dirname, "credentials/.env"),
    quiet: true
});
const { MongoClient, ServerApiVersion } = require("mongodb");


// For the express
app.use(bodyParser.urlencoded({ extended: false }));

// To run all CSS files for the web pages
app.use(express.static(path.join(__dirname, 'styles')));

// To read ejs files from the templates
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));


const databaseName = "CMSC335DB";
const collectionName = "gameReviews";
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

// To store API key
const RAWG_API_KEY = process.env.RAWG_API_KEY;

// model for game reviews (mongoose)
const GameReview = require("./models/GameReview.js");

async function addGameReview(gameData) {
    try {
        await mongoose.connect(uri);
        await GameReview.create({
            email: gameData.email,
            name: gameData.name,
            rating: gameData.rating,
            review: gameData.review
        });

    } catch (e) {
        console.error(e);
        throw e;
    }
    finally {
        await client.close();
    }
}


async function findGameByRating(userEmail, rating) {
    try {
        await mongoose.connect(uri);
        const ratingNum = parseFloat(rating);
        const results = await GameReview.find({email: userEmail, rating: { $gte: ratingNum }});
        return results;
    } catch (e) {
        console.error(e);
        throw e;
    }
    finally {
        mongoose.disconnect();
    }
}

// To include routes to index, review, and list of reviews
const routes = require("./routes");
app.use("/", routes);

app.post("/processReview", (request, response) => {
    const name = request.body.name;
    const email = request.body.email;
    const rating = request.body.rating;
    const review = request.body.review;

    const gameReview = {
        email: email,
        name: name,
        rating: parseFloat(rating),
        review: review
    };

    addGameReview(gameReview).then(() => {
        const now = new Date();
        const dateString = now.toLocaleString();
        response.render("reviewConformation", {
            email: email,
            name: name,
            rating: rating,
            review: review,
            date: dateString
        });
    }).catch((err) => {
        console.error('error');
    });
});

app.post("/processList", async (request, response) => { //Calvin
    const email = request.body.userEmail;
    const rating = request.body.RATINGgeq;

    findGameByRating(email, rating).then((games) => {
        let ratingTable = "<table border='1'>";
        ratingTable += "<tr><th>Game</th><th>Rating</th><th>Review</th></tr>";

        games.forEach(game => {
            ratingTable += `<tr><td>${game.name}</td><td>${game.rating}</td><td>${game.review}</td></tr>`;
        });

        ratingTable += "</table>";

        response.render("listReviewsProcess", {
            email: email,
            ratingTable: ratingTable
        });
    }).catch((err) => {
        console.error('error');
    });
});

app.get("/searchGame", (request, response) => {
    response.render("searchGame");
});

app.post("/processSearch", async (request, response) => {
    try {
        // To get the user game typed
        const searchedGame = request.body.search;

        // To get the platform user is interested in
        const selectedPlatform = request.body.parentPlatform;

        // If the searched game doesn't exist then just return no games
        if (!searchedGame && !selectedPlatform) {
            return response.render("searchResults", { query: "", games: [] });
        }

        const params = {
            key: RAWG_API_KEY,
            page_size: 10
        };

        // To let RAWG API filter if user entered a game
        if (searchedGame) {
            params.search = searchedGame;
        }

        // To let RAWG API filter based on platform
        if (selectedPlatform) {
            params.parent_platforms = selectedPlatform;
        }

        // Call the RAWG API
        const apiResp = await axios.get("https://api.rawg.io/api/games", { params });

        // To retrieve the data from the API result
        const rawGames = apiResp.data.results;

        // To display the full list of games from the search
        let games = [];

        // To put the name of each game into the array
        for (let i = 0; i < rawGames.length; i++) {
            const game = rawGames[i];

            const name = game.name;

            games.push({
                name: name
            });
        }

        // To display onto the website
        const variables = {
            query: searchedGame,
            games: games
        }

        response.render("searchResults", variables);

    } catch (error) {
        console.error("Error fetching games from RAWG API", error);
    }
});

app.get("/removeReviews", (request, response) => {
    response.render("removeReviews");
});

app.post("/processRemoval", async (request, response) => {
    try {
        await mongoose.connect(uri);
        const results = await GameReview.deleteMany({});
        response.render("processRemoval", { count: results.deletedCount });
    } catch (e) {
        console.error("Error removing all reviews: ", e);
    }
    finally {
        mongoose.disconnect();
    }
});

app.listen(portNumber);
console.log(`main URL http://localhost:${portNumber}/`);