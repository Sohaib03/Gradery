const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const homeEnd = require("./endpoints/home");
const database = require("./database/database");

require("dotenv").config();

const app = express();

app.use(
	session({
		secret: "secretkey",
		resave: true,
		saveUninitialized: true,
	})
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use("/auth", require("./routes/auth"));

app.get("/home", (req, res) => {
	return homeEnd.homeEndpoint(req, res);
});

app.listen(port, () => {
	console.log("Listening on port" + port);
});

database.startup();
process.once("SIGTERM", database.shutdown).once("SIGINT", database.shutdown);
