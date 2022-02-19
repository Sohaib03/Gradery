const db = require("./database");

async function sendInvitation(team_id, user_id, role, invited_by) {
    const sql = `BEGIN
    CREATE_INVITATION(:team_id, :user_id, :role, :invited_by);
    END;`;
    binds = { team_id, user_id, role, invited_by };
    return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
    sendInvitation,
};
