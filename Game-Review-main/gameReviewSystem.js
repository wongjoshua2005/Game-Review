// To initialize the Express
const express = require("express");   /* Accessing express module */
const app = express();  /* app is a request handler function */

// To initialize for MongoDB
const path = require("path");

// Standard initialization for the port number and reading the apps
const bodyParser = require("body-parser");

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

// To read ejs files from the templates
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

const databaseName = "CMSC335DB";
const collectionName = "gameReviews";
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

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

});

app.post("/processSearch", async (request, response) => {

});

app.get("/removeReviews", (request, response) => {
    response.render("removeReviews");
});

app.post("/processRemoval", async (request, response) => {
    try {
        const results = await client.db(databaseName).collection(collectionName).deleteMany({});
        response.render("processRemoval", { count: results.deletedCount});
    } catch (e) {
        console.error("Error removing all reviews: ", e);
    }
});

app.listen(portNumber);
console.log(`main URL http://localhost:${portNumber}/`);