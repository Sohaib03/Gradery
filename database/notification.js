const db = require("./database");

async function getNotificationOfTeam(team_id) {
  const sql = `SELECT * FROM NOTIFICATION N JOIN NOTIFICATION_RECEIVED_BY_TEAM T ON N.NOTIFICATION_ID = T.NOTIFICATION_ID WHERE T.TEAM_ID = ${team_id} ORDER BY N.TIMESTAMP DESC`;
  console.log(sql);
  const binds = {};
  return (await db.execute(sql, binds, db.options)).rows;
}

async function sendNotificationToTeam(team_id, title, content) {
  const sql = `begin
    create_team_notification(:team_id, :title, :content);
    end;`;
  binds = { team_id, title, content };
  return (await db.execute(sql, binds, db.options)).rows;
}

async function sendNotificationToUser(user_id, title, content) {
  const sql = `begin
  	create_user_notification(:user_id, :title, :content);
	  end;`;
  binds = { title, content };
  return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
  getNotificationOfTeam,
  sendNotificationToTeam,
};
