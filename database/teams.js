const db = require("./database");

async function getAllTeams(user_id) {
    const sql = `SELECT * FROM PARTICIPANT where USER_ID=:user_id`;
    const binds = { user_id: user_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getTeamInfo(team_id) {
    const sql = `SELECT * FROM TEAMS WHERE TEAM_ID=:team_id `;
    const binds = { team_id: team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function setTeamInfo(team_id, team_name, team_desc, course_id) {
    const sql = `UPDATE TEAMS SET TEAM_NAME = :team_name, TEAM_DESC = :team_desc,
     COURSE_ID = :course_id WHERE TEAM_ID = :team_id`;
    const binds = { team_id, team_name, team_desc, course_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getTeamByCode(team_code) {
    const sql = `SELECT * FROM TEAMS WHERE TEAM_CODE=:team_code`;
    const binds = { team_code: team_code };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function createNewTeam(
    user_id,
    team_name,
    team_code,
    team_desc,
    course_id
) {
    const sql = `begin
        create_team(:team_name, :user_id, :team_code, :team_desc, :course_id);
    end;`;
    const binds = {
        team_name,
        user_id,
        team_code,
        team_desc,
        course_id,
    };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function addParticipant(user_id, team_id, role) {
    const sql = `INSERT INTO PARTICIPANT (USER_ID, TEAM_ID, ROLE) VALUES(:user_id, :team_id, :role)`;
    const binds = {
        user_id: user_id,
        team_id: team_id,
        role: role,
    };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function deleteParticipant(user_id, team_id) {
    const sql = `DELETE FROM PARTICIPANT WHERE USER_ID = :user_id AND TEAM_ID = :team_id`;
    const binds = {
        user_id,
        team_id,
    };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function addParticipantWithCode(user_id, team_code, role) {
    let team_query = await getTeamByCode(team_code);
    if (team_query.length === 0) {
        return 0;
    } else {
        await addParticipant(user_id, team_query[0].TEAM_ID, role);
        return 1;
    }
}

async function checkUserInTeam(user_id, team_id) {
    const sql = `SELECT * FROM PARTICIPANT WHERE USER_ID=:user_id AND TEAM_ID=:team_id`;
    const binds = {
        user_id: user_id,
        team_id: team_id,
    };
    let result = (await db.execute(sql, binds, db.options)).rows;
    return result;
}

async function getParticipantsOfTeam(team_id) {
    // const sql = `SELECT * FROM PARTICIPANT WHERE TEAM_ID=:team_id`;
    // let binds = {
    //     team_id,
    // };
    // let result = (await db.execute(sql, binds, db.options)).rows;
    // let user_ids = [];
    // for (let i = 0; i < result.length; i++) {
    //     user_ids.push(result[i].USER_ID);
    // }
    // const sql2 = `SELECT * FROM USERS WHERE USER_ID in (${user_ids})`;
    // binds = {};
    // result = (await db.execute(sql2, binds, db.options)).rows;
    // return result;

    const sql = `SELECT P.USER_ID, U.USERNAME, P.ROLE FROM PARTICIPANT P JOIN USERS U ON P.TEAM_ID = :team_id AND P.USER_ID = U.USER_ID`;
    let binds = { team_id };
    let r = (await db.execute(sql, binds, db.options)).rows;
    return r;
}

module.exports = {
    getAllTeams,
    getTeamInfo,
    setTeamInfo,
    getTeamByCode,
    createNewTeam,
    addParticipant,
    addParticipantWithCode,
    checkUserInTeam,
    getParticipantsOfTeam,
    deleteParticipant,
};
