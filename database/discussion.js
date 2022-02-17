const db = require("./database");

async function createDiscussion(title, body, team_id) {
	const sql = `INSERT INTO DISCUSSION (TITLE, BODY, TEAM_ID) VALUES (:title, :body, :team_id)`;
	const binds = { title, body, team_id };
	return (await db.execute(sql, binds, db.options)).rows;
}

async function createNewMessage(discussion_id, from_user, content) {
	const sql = `INSERT INTO MESSAGE (DISCUSSION_ID, FROM_USER, CONTENT) VALUES (:discussion_id, :from_user, :content)`;
	binds = { discussion_id, from_user, content };
	return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
	createDiscussion,
	createNewMessage,
};
