const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");

router.route("/create").get(auth.authMiddleware, async (req, res) => {
	var context = {
		title: "Create a New Team",
		username: req.session.username,
	};
	res.render("createTeam", context);
});

module.exports = {
	router,
};
