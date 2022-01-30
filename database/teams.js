const db = require("./database");

async function getAllTeams(user_id) {
	const sql = `SELECT * FROM PARTICIPANT where "USER"=:user_id`;
	const binds = { user_id: user_id };
	return (await db.execute(sql, binds, db.options)).rows;
}

async function getTeamInfo(team_id) {
	const sql = `SELECT * FROM TEAMS WHERE TEAM_ID=:team_id `;
	const binds = { team_id: team_id };
	return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
	getAllTeams,
	getTeamInfo,
};
