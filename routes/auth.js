const express = require("express");

const hashUtils = require("../utils/hash");
const users = require("../database/users");
const homeEnd = require("../controllers/home");
const router = express.Router();

router.route("/login").get(async (req, res) => {
	if (req.session.username) {
		res.redirect("/");
		return;
	}
	var context = {
		title: "Login",
		notification: req.session.notification,
	};
	req.session.notification = undefined;
	res.render("login", context);
});

router.route("/login").post(async (req, res) => {
	console.log(req.body);
	var username = req.body.username;
	var password = req.body.password;

	var result = await users.getUser(username);
	if (result.length == 0) {
		res.send("No such user found");
		res.end();
	} else {
		if (await hashUtils.verify(password, result[0].PASSWORD)) {
			req.session.loggedIn = true;

			req.session.username = username;
			req.session.user_id = result[0].USERID;

			const notification = {
				status: " is-success is-light ",
				content: "Welcome, " + username,
			};
			req.session.notification = notification;
			return res.redirect("/");
		} else {
			req.session.notification = {
				status: " is-danger is-light ",
				content: "Unknown username or password",
			};
			return res.redirect("/auth/login");
		}
	}
});

router.route("/register").get(async (req, res) => {
	if (req.session.username) {
		res.redirect("/");
		return;
	}
	var context = {
		notification: req.session.notification,
	};
	req.session.notification = undefined;
	res.render("register", context);
});

router.route("/register").post(async (req, res) => {
	var username = req.body.username;
	var password = req.body.password;

	var result = await users.getUser(username);
	if (result.length != 0) {
		req.session.notification = {
			status: " is-warning is-light ",
			content:
				"Username is already taken. Try using a different username",
		};
		return res.redirect("/auth/register");
	}

	const hashedPassword = await hashUtils.hash(password);

	result = await users.createUser({
		username: username,
		password: hashedPassword,
	});

	if (result && result.rowsAffected === 1) {
		req.session.notification = {
			status: " is-success is-light ",
			content: "Account created. Please verify your email before login.",
		};

		return res.redirect("/auth/login");
	} else {
		req.session.notification = {
			status: " is-warning is-light ",
			content:
				"Account was not created due to internal errors. Please try again",
		};
		return res.redirect("/auth/register");
	}
});

router.route("/logout").get((req, res) => {
	if (req.session.username) {
		req.session.destroy();
	}
	res.redirect("/auth/login");
});

router.route("/allUsers").get(async (req, res) => {
	var allUsersList = await users.getAllUsers();
	var context = {
		message: "Welcome to Gradery",
		allUsersList: allUsersList,
	};

	res.render("allUsers", context);
});

function authMiddleware(req, res, next) {
	if (!req.session.username) {
		res.redirect("/auth/login");
	} else {
		next();
	}
}

module.exports = {
	router,
	authMiddleware,
};
