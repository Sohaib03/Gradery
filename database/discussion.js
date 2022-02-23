const db = require("./database");

async function createDiscussion(title, body, team_id) {
    const sql = `INSERT INTO DISCUSSION (TITLE, BODY, TEAM_ID) VALUES (:title, :body, :team_id)`;
    const binds = { title, body, team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function deleteDiscussion(dis_id) {
    const sql = `DELETE FROM DISCUSSION WHERE DISCUSSION_ID = :dis_id`;
    const binds = { dis_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function createNewMessage(discussion_id, from_user, content) {
    const sql = `INSERT INTO MESSAGE (DISCUSSION_ID, FROM_USER, CONTENT) VALUES (:discussion_id, :from_user, :content)`;
    const binds = { discussion_id, from_user, content };
    return (await db.execute(sql, binds, db.options)).rows;
}
async function getDiscussionInfo(dis_id) {
    const sql = `SELECT * FROM DISCUSSION WHERE DISCUSSION_ID=:dis_id`;
    const binds = { dis_id };
    return (await db.execute(sql, binds, db.options)).rows;
}
async function getTeamDiscussion(team_id) {
    const sql = `SELECT * FROM DISCUSSION WHERE TEAM_ID=:team_id and STATUS=1`;
    const binds = { team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getDiscussionMessage(dis_id) {
    const sql = `select CONTENT, USERNAME, TIMESTAMP from MESSAGE M
        join DISCUSSION D on M.DISCUSSION_ID = D.DISCUSSION_ID
        join USERS U on M.FROM_USER = U.USER_ID
        where D.DISCUSSION_ID = :dis_id
        order by TIMESTAMP DESC`;
    const binds = { dis_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getDefaultDiscussion(team_id) {
    const sql = `select CONTENT, USERNAME, TIMESTAMP from MESSAGE M
        join DISCUSSION D on M.DISCUSSION_ID = D.DISCUSSION_ID
        join TEAMS T on D.TEAM_ID = T.TEAM_ID
        join USERS U on M.FROM_USER = U.USER_ID
        where T.TEAM_ID = :team_id and D.STATUS = 1
        order by TIMESTAMP DESC`;
    const binds = { team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function sendToDefaultMessage(team_id, message, from_user) {
    const sql = `select * from DISCUSSION where TEAM_ID = :team_id and STATUS = 1`;
    const binds = { team_id };
    let res = (await db.execute(sql, binds, db.options)).rows;
    await createNewMessage(res[0].DISCUSSION_ID, from_user, message);
}

async function getAllDiscussion(team_id) {
    const sql = `SELECT * FROM DISCUSSION WHERE TEAM_ID=:team_id`;
    const binds = { team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
    createDiscussion,
    deleteDiscussion,
    createNewMessage,
    getDefaultDiscussion,
    sendToDefaultMessage,
    getTeamDiscussion,
    getDiscussionMessage,
    getDiscussionInfo,
    getAllDiscussion,
};
