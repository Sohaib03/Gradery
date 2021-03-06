const db = require("./database");

async function getNotificationOfTeam(team_id) {
    const sql = `SELECT * FROM NOTIFICATION N JOIN NOTIFICATION_RECEIVED_BY_TEAM T ON N.NOTIFICATION_ID = T.NOTIFICATION_ID WHERE T.TEAM_ID = ${team_id} ORDER BY N.TIMESTAMP DESC`;
    console.log(sql);
    const binds = {};
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getNotificationOfUser(user_id) {
    const sql = `SELECT * FROM NOTIFICATION N JOIN NOTIFICATION_RECEIVED_BY_USER U ON N.NOTIFICATION_ID = U.NOTIFICATION_ID WHERE U.USER_ID = ${user_id} ORDER BY N.TIMESTAMP DESC`;
    console.log(sql);
    const binds = {};
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getUserNotificationById(user_id, notif_id) {
    const sql = `SELECT * FROM NOTIFICATION N JOIN NOTIFICATION_RECEIVED_BY_USER U ON N.NOTIFICATION_ID = U.NOTIFICATION_ID WHERE U.USER_ID = ${user_id} AND U.NOTIFICATION_ID = ${notif_id} ORDER BY N.TIMESTAMP DESC`;
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

async function deleteNotification(notif_id) {
    const sql = `DELETE FROM NOTIFICATION WHERE NOTIFICATION_ID = :notif_id`;
    binds = { notif_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
    getNotificationOfTeam,
    sendNotificationToTeam,
    sendNotificationToUser,
    getNotificationOfUser,
    getUserNotificationById,
    deleteNotification,
};
