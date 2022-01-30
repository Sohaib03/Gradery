const teams = require("../database/teams");
const users = require("../database/users");

async function homeEndpoint(req, res) {
	const userData = await users.getUser(req.session.username);
	const userTeamIDs = await teams.getAllTeams(userData[0].USERID);
	let userTeams = [];
	for (let i = 0; i < userTeamIDs.length; i++) {
		userTeams.push((await teams.getTeamInfo(userTeamIDs[i].TEAM))[0]);
	}

	console.log(userTeams);

	const context = {
		title: "Homepage",
		username: req.session.username,
		teamsID: userTeamIDs,
		teamsInfo: userTeams,
	};
	if (req.session.notification) {
		context.notification = req.session.notification;
		req.session.notification = undefined;
	}
	res.render("home", context);
}

module.exports = {
	homeEndpoint,
};
