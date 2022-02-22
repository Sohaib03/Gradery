const db = require("./database");

async function createResource(title, descrip, file_path, team_id) {
    const sql = `INSERT INTO RESOURCES (TEAM_ID, TITLE, DESCRIPTION, FILE_PATH) VALUES (:team_id, :title, :descrip, :file_path)`;
    const binds = {team_id, title, descrip, file_path};
	return (await db.execute(sql, binds, db.options)).rows;
}
async function deleteResource(res_id) {
    const sql = `DELETE FROM RESOURCES WHERE RESOURCE_ID=:res_id`;
    const binds = {res_id};
	return (await db.execute(sql, binds, db.options)).rows;
}
async function getAllResource(team_id) {
    const sql = `SELECT * FROM RESOURCES WHERE TEAM_ID=:team_id`;
    const binds = {team_id};
	return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
    createResource,
    deleteResource,
    getAllResource,
}