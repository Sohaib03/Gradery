const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const discussionDB = require("../database/discussion");

router
	.route("/:dis_id/:team_code/:team_id")
	.post(auth.authMiddleware, async (req, res) => {
		const dis_id = req.params.dis_id;
		const team_code = req.params.team_code;
		const team_id = req.params.team_id;

		const message = req.body.message;
		const user_id = req.session.user_id;

		discussionDB.sendToDefaultMessage(team_id, message, user_id);

		res.redirect("/teams/code/" + team_code);
	});

module.exports = {
	router,
};
