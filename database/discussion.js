const db = require("./database");

async function createDiscussion(title, body, team_id) {
	const sql = `INSERT INTO DISCUSSION (TITLE, BODY, TEAM_ID) VALUES (:title, :body, :team_id)`;
	const binds = { title, body, team_id };
	return (await db.execute(sql, binds, db.options)).rows;
}

async function createNewMessage(discussion_id, from_user, content) {
	const sql = `INSERT INTO MESSAGE (DISCUSSION_ID, FROM_USER, CONTENT) VALUES (:discussion_id, :from_user, :content)`;
	const binds = { discussion_id, from_user, content };
	return (await db.execute(sql, binds, db.options)).rows;
}

async function getDefaultDiscussion(team_id) {
	const sql = `select CONTENT, USERNAME, TIMESTAMP from MESSAGE M
        join DISCUSSION D on M.DISCUSSION_ID = D.DISCUSSION_ID
        join TEAMS T on D.TEAM_ID = T.TEAM_ID
        join USERS U on M.FROM_USER = U.USERID
        where T.TEAM_ID = :team_id and D.STATUS = 1
        order by TIMESTAMP`;
	const binds = { team_id };
	return (await db.execute(sql, binds, db.options)).rows;
}

async function sendToDefaultMessage(team_id, message, from_user) {
	const sql = `select * from DISCUSSION where TEAM_ID = :team_id and STATUS = 1`;
	const binds = { team_id };
	let res = (await db.execute(sql, binds, db.options)).rows;
	await createNewMessage(res[0].DISCUSSION_ID, from_user, message);
}

module.exports = {
	createDiscussion,
	createNewMessage,
	getDefaultDiscussion,
	sendToDefaultMessage,
};
