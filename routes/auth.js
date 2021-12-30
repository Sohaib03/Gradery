const express = require("express");

const hashUtils = require("../utils/hash");

const database = require("../database/database");
const users = require("../database/users");

const router = express.Router();

router.route("/login").get(async (req, res) => {
	if (req.session.username) {
		// TODO : Redirect to the logout page
		res.redirect("/home");
		return;
	}
	res.render("login", { title: "Login System" });
});

router.route("/login").post(async (req, res) => {
	console.log(req.body);
	var username = req.body.username;
	var password = req.body.password;

	result = await users.getUser(username);
	if (result.length == 0) {
		res.send("No such user found");
		res.end();
	} else {
		if (await hashUtils.verify(password, result[0].PASSWORD)) {
			req.session.loggedIn = true;
			req.session.username = username;
			res.redirect("/home");
		} else {
			res.send("Wrong password");
		}
		res.end();
	}
});

router.route("/register").get(async (req, res) => {
	res.render("register");
});

router.route("/register").post(async (req, res) => {
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
		// TODO : Redirect to the login page
	} else {
		// TODO : Redirect to the register page
		res.send("Error while creating account");
	}
	res.end();
});

router.route("/logout").get((req, res) => {
	if (req.session.username) {
		req.session.destroy();
	}
	res.redirect("/auth/login");
});

module.exports = router;
