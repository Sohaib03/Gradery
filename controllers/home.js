const teams = require("../database/teams");
const users = require("../database/users");

async function homeEndpoint(req, res) {
	const userTeamIDs = await teams.getAllTeams(req.session.user_id);
	let userTeams = [];
	for (let i = 0; i < userTeamIDs.length; i++) {
		userTeams.push((await teams.getTeamInfo(userTeamIDs[i].TEAM_ID))[0]);
	}

	console.log(userTeams);

	const context = {
		title: "Homepage",
		username: req.session.username,
		role: req.session.role,
		teamsID: userTeamIDs,
		teamsInfo: userTeams,
	};
	console.log(context);
	if (req.session.notification) {
		context.notification = req.session.notification;
		req.session.notification = undefined;
	}
	res.render("home", context);
}

module.exports = {
	homeEndpoint,
};
