const db = require("./database");

async function sendInvitation(team_id, user_id, role, invited_by) {
    const sql = `INSERT INTO INVITATION(TEAM_ID, USER_ID, ROLE, INVITED_BY) VALUES (:team_id, :user_id, :role, :invited_by)`;
    binds = { team_id, user_id, role, invited_by };
    return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
    sendInvitation,
};
