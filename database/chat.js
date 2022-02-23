const db = require("./database");

async function sendMessage(
    from_user,
    to_user,
    from_username,
    to_username,
    message
) {
    const sql = `insert into CHAT (FROM_USER, TO_USER, MESSAGE, FROM_USERNAME, TO_USERNAME) values (:from_user, :to_user,:message, :from_username, :to_username)`;
    const binds = { from_user, to_user, from_username, to_username, message };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getAllMessages(from_user_id, to_user_id) {
    const sql = `SELECT * FROM CHAT C 
    WHERE (FROM_USER = :from_user_id AND TO_USER = :to_user_id) OR 
    (FROM_USER = :to_user_id AND TO_USER = :from_user_id)
        order by TIMESTAMP DESC
    `;
    const binds = { from_user_id, to_user_id, from_user_id, to_user_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function latestMessages(user_id) {
    const sql = `
    select * from chat C where (FROM_USER = :user_id or TO_USER = :user_id) and C.TIMESTAMP =
    (select max(C2.TIMESTAMP) from chat C2 where (C2.FROM_USER = C.TO_USER and C2.TO_USER=C.FROM_USER) or
                                                 (C2.FROM_USER = C.FROM_USER and C2.TO_USER = C.TO_USER))
    `;
    const binds = { user_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
    sendMessage,
    getAllMessages,
    latestMessages,
};
