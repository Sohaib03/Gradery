const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const hashUtils = require("./Utils/Hash");

const database = require("./database/database");
const users = require("./database/users");
const utils = require("nodemon/lib/utils");

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

app.get("/login", async (req, res) => {
	res.render("login", { title: "Login System" });
});

app.post("/login", async (req, res) => {
	console.log(req.body);
	var username = req.body.username;
	var password = req.body.password;

	result = await users.getUser(username);
	if (result.length == 0) {
		res.send("No such user found");
		res.end();
	} else {
		if (await hashUtils.verify(password, result[0].PASSWORD)) {
			res.send("User Logged In");
		} else {
			res.send("Wrong password");
		}
		res.end();
	}
});

app.get("/register", async (req, res) => {
	res.render("register");
});

app.post("/register", async (req, res) => {
	console.log("Made a register request");
	var username = req.body.username;
	var password = req.body.password;

	//  TODO : Check if the username already exists in the database

	const hashedPassword = await hashUtils.hash(password);

	result = await users.createUser({
		username: username,
		password: hashedPassword,
	});

	if (result && result.rowsAffected === 1) {
		res.send("Done");
	} else {
		res.send("Error while creating account");
	}
	res.end();
});

app.listen(port, () => {
	console.log("Listening on port" + port);
});

database.startup();
process.once("SIGTERM", database.shutdown).once("SIGINT", database.shutdown);
