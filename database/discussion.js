const db = require("./database");

async function createDiscussion(title, body) {
	const sql = `INSERT INTO DISCUSSION (TITLE, BODY) VALUES (:title, :body)`;
	const binds = { title, body };
	return (await db.execute(sql, binds, db.options)).rows;
}

async function addDiscussionToTeam(discussion_id, team_id) {
	const sql = `INSERT INTO TEAM_DISCUSSION (TEAM_ID, DISCUSSION_ID) VALUES (:team_id, :discussion_id)`;
	const binds = { team_id, discussion_id };
	return (await db.execute(sql, binds, db.options)).rows;
}

async function createNewMessage(discussion_id, from_user, content) {
	const sql = `INSERT INTO MESSAGE (DISCUSSION_ID, FROM_USER, CONTENT) VALUES (:discussion_id, :from_user, :content)`;
	binds = { discussion_id, from_user, content };
	return (await db.execute(sql, binds, db.options)).rows;
}
