const express = require("express");
const router = express.Router();
const auth = require("../routes/auth");
const genUtils = require("../utils/generators");
const teams = require("../database/teams");

router.route("/create").get(auth.authMiddleware, async (req, res) => {
	let context = {
		title: "Create a New Team",
		username: req.session.username,
	};
	res.render("createTeam", context);
});

router.route("/create").post(auth.authMiddleware, async (req, res) => {
	const team_name = req.body.team_name;
	const team_desc = req.body.team_desc;

	let random_team_code = genUtils.random8Gen();
	let team_query = await teams.getTeamByCode(random_team_code);
	while (team_query.length != 0) {
		random_team_code = genUtils.random8Gen();
		team_query = await teams.getTeamByCode(random_team_code);
	}

	let r = await teams.createNewTeam(
		req.session.user_id,
		team_name,
		random_team_code
	);
	r = await teams.addParticipantWithCode(
		req.session.user_id,
		random_team_code,
		"admin"
	);
	console.log(r);

	let context = {
		title: "Create a New Team",
		username: req.session.username,
	};
	res.render("createTeam", context);
});

router.route("/join").get(auth.authMiddleware, async (req, res) => {
	let context = {
		title: "Join a New Team",
		username: req.session.username,
	};
	res.render("joinTeam", context);
});

router.route("/join").post(auth.authMiddleware, async (req, res) => {
	const team_code = req.body.team_code;
	console.log(team_code);
	let context = {
		title: "Join a New Team",
		username: req.session.username,
	};
	let r = await teams.addParticipantWithCode(
		req.session.user_id,
		team_code,
		"general"
	);
	res.render("joinTeam", context);
});

router.route("/code/:code").get(auth.authMiddleware, async (req, res) => {
	const team_code = req.params.code;
	// Check if team_exists
	let team_info = await teams.getTeamByCode(team_code);
	if (team_info.length === 0) {
		// Team Doesnt exist. Notify User
		res.redirect("/");
		return;
	}
	const team_id = team_info[0].TEAM_ID;
	// Check if user is in given team
	if ((await teams.checkUserInTeam(req.session.user_id, team_id)) === 0) {
		// Team Exists but User has not joined team
		res.redirect("/teams/join");
		return;
	}

	let context = {
		title: team_info[0].TEAM_NAME,
		username: req.session.username,
		team_code: team_code,
		team_name: team_info[0].TEAM_NAME,
		participants: await teams.getParticipantsOfTeam(team_id),
	};
	res.render("teamHome", context);
});

module.exports = {
	router,
};
