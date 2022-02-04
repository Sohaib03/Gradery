const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const homeEnd = require("./controllers/home");
const database = require("./database/database");
const auth = require("./routes/auth");
const teams = require("./routes/teams");

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

app.use("/auth", auth.router);
app.use("/teams", teams.router);

app.get("/", auth.authMiddleware, (req, res) => {
	return homeEnd.homeEndpoint(req, res);
});

app.listen(port, () => {
	console.log("Listening on port" + port);
});

database.startup();
process.once("SIGTERM", database.shutdown).once("SIGINT", database.shutdown);
