const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const upload = require("express-fileupload");

const homeEnd = require("./controllers/home");
const database = require("./database/database");
const auth = require("./routes/auth");
const teams = require("./routes/teams");
const assignment = require("./routes/assignment");
const discussion = require("./routes/discussion");

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

app.use(
	upload({
		debug: true,
	})
);
app.use("/auth", auth.router);
app.use("/teams", teams.router);
app.use("/dis", discussion.router);
app.use("/assignment", assignment.router);

app.get("/file/download/uploads/:path", (req, res) => {
	const file_path = "./uploads/" + req.params.path;
	res.download(file_path);
});
app.get("/", auth.authMiddleware, (req, res) => {
	return homeEnd.homeEndpoint(req, res);
});

app.listen(port, () => {
	console.log("Listening on port" + port);
});

database.startup();
process.once("SIGTERM", database.shutdown).once("SIGINT", database.shutdown);
