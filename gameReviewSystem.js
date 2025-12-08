// To initialize the CLI 
const http = require('http');
const fs = require("fs");
const util = require("util");

// To initialize for MongoDB
const path = require("path");

// To initialize the Express
const express = require("express");   /* Accessing express module */
const app = express();  /* app is a request handler function */

// Standard initialization for the port number and reading the apps
const bodyParser = require("body-parser");

const portNumber = process.argv[2];
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

// To ensure the arguments from the standard input is valid
if (process.argv.length != 3) {
    process.stdout.write(`Usage gameReviewSystem.js PORT_NUMBER_HERE`);
    process.exit(1);
}

// To render the page when first click on the link
app.get("/", (request, response) => {
    response.render("index");
});

app.get("/review", (request, response) => {
    
});

app.post("/processReview", (request, response) => {

});

app.get("/listOfReviews", (request, response) => {

});

app.post("/processList", async (request, response) => {

});

app.get("/searchGame", (request, response) => {

});

app.post("/processSearch", async (request, response) => {

});

app.get("/removeReviews", (request, response) => {
});

app.post("/processRemoval", async (request, response) => {

});

// To run web server when first starting the application in the terminal
const webServer = http.createServer(app);

// Ask user to type a command in the CLI when first boot up
webServer.listen(portNumber, () => {
    console.log(`Web server started and running at http://localhost:${portNumber}`);
    process.stdout.write("Stop to shutdown the server: ");
});

process.stdin.setEncoding("utf8"); /* encoding */

// The main reading for the CLI
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
    // To convert the JSON file and the input reading from the user
    const dataInput = process.stdin.read();

    // To ensure the input is actually valid and entered
    if (dataInput !== null) {
        const command = dataInput.trim();

        if (command === "stop") {
            // Not using console.log as it adds a newline by default
            process.stdout.write("Shutting down the server");
            process.exit(0);  /* exiting */
        } else {
            /* After invalid command, we cannot type anything else */
            process.stdout.write(`Invalid command: ${command}\n`);
            process.stdout.write("Stop to shutdown the server: ");
        }

        process.stdin.resume(); // Allows the code to process next request
    }
});

async function main(command, name, email, gpa, info) {
    const databaseName = "CMSC335DB";
    const collectionName = "gameReviews";
    const uri = process.env.MONGO_CONNECTION_STRING;
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    let result;

    try {
        await client.connect();
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        if (command === "insert") {
            /* Inserting application */
            const application = { name: name, email: email, GPA: gpa, info: info };
            result = await collection.insertOne(application);
        } else if (command === "lookup") {
            let filter = { email: email };
            result = await collection.findOne(filter);
            return result;
        } else if (command === "lookupGPA") {
            filter = { GPA: { $gte: gpa } };
            const cursor = await collection.find(filter).toArray();
            return cursor;
        } else if (command === "removeApps") {
            const total = await collection.countDocuments({});
            const result = await collection.drop();

            return total;
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}