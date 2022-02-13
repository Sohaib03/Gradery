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

async function createUser(userData) {
	const sql = `INSERT INTO users (USERNAME, PASSWORD) VALUES (:username, :password)`;
	const binds = { username: userData.username, password: userData.password };
	console.log(binds);
	return await db.execute(sql, binds, db.options);
}

async function createInstructor(userData) {
	const sql = `INSERT INTO users (USERNAME, PASSWORD) VALUES (:username, :password)`;
	const binds = { username: userData.username, password: userData.password };
	console.log(binds);
	return await db.execute(sql, binds, db.options);
}
async function createStudent(userData) {
	const sql = `INSERT INTO users (USERNAME, PASSWORD, ROLE) VALUES (:username, :password, 1)`;
	const binds = { username: userData.username, password: userData.password };
	console.log(binds);
	return await db.execute(sql, binds, db.options);
}

module.exports = {
	getAllUsers,
	getUser,
	createUser,
	createInstructor,
	createStudent,
};
