const db = require("./database");

async function getAllCourses() {
	const sql = `SELECT * FROM COURSE`;
	const binds = {};
	return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
	getAllCourses,
};
