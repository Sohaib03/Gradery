const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const discussionDB = require("../database/discussion");
const teams = require("../database/teams");

router
	.route("/:dis_id/:team_code/:team_id/:def")
	.post(auth.authMiddleware, async (req, res) => {
		const dis_id = req.params.dis_id;
		const team_code = req.params.team_code;
		const team_id = req.params.team_id;
		const def = req.params.def;

		const message = req.body.message;
		const user_id = req.session.user_id;

		discussionDB.createNewMessage(dis_id, user_id, message);

		if (def === "1") res.redirect("/teams/code/" + team_code);
		else res.redirect("/dis/" + dis_id + "/" + team_id);
	});

router.route("/create/:team_id").get(auth.authMiddleware, async (req, res) => {
	const team_id = req.params.team_id;

	let context = {
		title: "Create Discussion",
		username: req.session.username,
		role: req.session.role,
	};

	res.render("newDiscussion", context);
});

router.route("/create/:team_id").post(auth.authMiddleware, async (req, res) => {
	const team_id = req.params.team_id;
	const discussion_title = req.body.dis_title;
	const discussion_body = req.body.dis_content;
	console.log({ team_id, discussion_body, discussion_title });
	await discussionDB.createDiscussion(
		discussion_title,
		discussion_body,
		team_id
	);
	const team_info = await teams.getTeamInfo(team_id);
	res.redirect("/teams/code/" + team_info[0].TEAM_CODE);
});

router.route("/:dis_id/:team_id").get(auth.authMiddleware, async (req, res) => {
	const dis_id = req.params.dis_id;
	const team_id = req.params.team_id;
	const team_info = await teams.getTeamInfo(team_id);
	console.log(team_info);
	const cur_discussion = await discussionDB.getDiscussionMessage(dis_id);
	const dis_info = await discussionDB.getDiscussionInfo(dis_id);
	let context = {
		title: "Create Discussion",
		username: req.session.username,
		role: req.session.role,
		discussion: cur_discussion,
		dis_id: dis_id,
		team_code: team_info[0].TEAM_CODE,
		team_id: team_id,
		dis_title: dis_info[0].TITLE,
		dis_content: dis_info[0].BODY,
	};

	res.render("discussionPage", context);
});

module.exports = {
	router,
};
