const db = require("./database");

async function sendInvitation(user_id, team_id, role, invited_by) {
    console.log("HERE");
    const sql = `INSERT INTO INVITATION(USER_ID, TEAM_ID, ROLE, INVITED_BY) VALUES (:user_id, :team_id, :role, :invited_by)`;
    binds = { user_id, team_id, role, invited_by };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function invitationDoesntExist(user_id, team_id) {
    const sql = `SELECT * FROM INVITATION WHERE USER_ID = :user_id AND TEAM_ID = :team_id`;
    binds = { user_id, team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getInvitation(user_id, team_id) {
    const sql = `SELECT * FROM INVITATION WHERE USER_ID = :user_id AND TEAM_ID = :team_id`;
    binds = { user_id, team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function deleteInvitation(user_id, team_id) {
    const sql = `DELETE FROM INVITATION WHERE USER_ID = :user_id AND TEAM_ID = :team_id`;
    binds = { user_id, team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
    sendInvitation,
    getInvitation,
    invitationDoesntExist,
    deleteInvitation,
};
