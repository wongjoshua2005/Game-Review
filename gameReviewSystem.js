// To initialize the Express
const express = require("express");   /* Accessing express module */
const app = express();  /* app is a request handler function */

// To initialize for MongoDB
const path = require("path");

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

async function addGameReview(gameData) {
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        const result = await collection.insertOne(applicantData);
        return result.insertedId;
    } catch (e) {
        console.error(e);
        throw e;
    }
    finally {
        await client.close();
    }
}


async function findGameByRating(rating) {
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        const ratingNum = parseFloat(rating);
        const results = await collection.find({ Rating: { $gte: ratingNum } }).toArray();
        return results;
    } catch (e) {
        console.error(e);
        throw e;
    }
    finally {
        await client.close();
    }
}

// To render the page when first click on the link
app.get("/", (request, response) => {
    response.render("index");
});

app.get("/review", (request, response) => {
    const variables = {
        destination: `http://localhost:${portNumber}/processReview`
    }
    response.render("review", variables);
});

app.post("/processReview", (request, response) => {
    const name = request.body.name;
    const email = request.body.email;
    const rating = request.body.rating;
    const review = request.body.review;

    const gameReview = {
        name: name,
        email: email,
        rating: parseFloat(rating),
        review: review
    };

    addGameReview(gameReview).then((id) => {
        const now = new Date();
        const dateString = now.toLocaleString();
        response.render("applicantComformation", {
            name: name,
            email: email,
            rating: rating,
            review: review,
            date: dateString
        });
    }).catch((err) => {
        console.error('error');
    });
});

app.get("/listOfReviews", (request, response) => { //Calvin
    response.render("listReviews");
});

app.post("/processList", async (request, response) => { //Calvin
    const rating = request.body.RATINGgeq;

    findGameByRating(rating).then((games) => {
        let ratingTable = "<table border='1'>";
        ratingTable += "<tr><th>Name</th><th>Rating</th><th>Review</th></tr>";

        games.forEach(game => {
            ratingTable += `<tr><td>${game.name}</td><td>${game.rating}</td><td>${game.review}</td></tr>`;
        });

        ratingTable += "</table>";

        response.render("listReviewsProcess", {
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

        // To test it works and retrieve the right data
        console.log(rawGames);

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
        const results = await client.db(databaseName).collection(collectionName).deleteMany({});
        response.render("processRemoval", { count: results.deletedCount });
    } catch (e) {
        console.error("Error removing all reviews: ", e);
    }
});

app.listen(portNumber);
console.log(`main URL http://localhost:${portNumber}/`);