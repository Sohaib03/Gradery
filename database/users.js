const db = require("./database");

async function getAllUsers() {
	const sql = `SELECT * FROM users `;
	const binds = {};
	return (await db.execute(sql, binds, db.options)).rows;
}

async function getUser(username) {
	const sql = `SELECT * FROM users WHERE username=:username`;
	const binds = { username: username };
	return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
	getAllUsers,
	getUser,
};
