const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const database = require("./database/database");
const users = require("./database/users");

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
	console.log(process.env.DB_USER);
	res.render("login", { title: "Login System" });
	console.log(await users.getAllUsers());
});

app.post("/login", async (req, res) => {
	console.log(req.body);
	var username = req.body.username;
	var password = req.body.password;

	console.log("User :" + username + " Pass :" + password);

	result = await users.getUser(username);
	if (result.length == 0) {
		res.send("No such user found");
		res.end();
	} else {
		console.log(result[0].PASSWORD);
		if (result[0].PASSWORD === password) {
			res.send("User Logged In");
		} else {
			res.send("Wrong password");
		}
		res.end();
	}
});

app.listen(port, () => {
	console.log("Listening on port" + port);
});

database.startup();
process.once("SIGTERM", database.shutdown).once("SIGINT", database.shutdown);
