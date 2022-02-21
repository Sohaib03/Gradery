const db = require("./database");

async function getAllNewAssignmentsForStudent(user_id) {
    const sql = `SELECT * FROM ASSIGNED_TO WHERE STUDENT_ID = :user_id AND SUBMISSION_STATUS = 0`;
    const binds = { user_id: user_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getAllNewAssignmentsForStudentInTeam(user_id, team_id) {
    const sql = `SELECT A.ASSIGNMENT_ID as ASSIGNMENT_ID, ASSIGNMENT_TITLE, STUDENT_ID, DEADLINE,
    TRUNC(DEADLINE - SYSDATE) as DAYS
    FROM
    ASSIGNED_TO T JOIN (SELECT ASSIGNMENT_TITLE, ASSIGNMENT_ID, DEADLINE FROM ASSIGNMENTS WHERE TEAM_ID = :team_id) A
        ON (A.ASSIGNMENT_ID = T.ASSIGNMENT_ID) WHERE STUDENT_ID = :user_id 
                                                 AND SUBMISSION_STATUS = 0`;
    const binds = { user_id: user_id, team_id: team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getAllCompletedAssignmentsForStudent(user_id) {
    const sql = `SELECT * FROM ASSIGNED_TO WHERE STUDENT_ID = :user_id AND SUBMISSION_STATUS = 1`;
    const binds = { user_id: user_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getAllCompletedAssignmentsForStudentInTeam(user_id, team_id) {
    const sql = `SELECT T.ASSIGNMENT_ID, A.ASSIGNMENT_TITLE FROM ASSIGNED_TO T JOIN (SELECT ASSIGNMENT_ID, ASSIGNMENT_TITLE FROM ASSIGNMENTS WHERE TEAM_ID = :team_id) A ON (A.ASSIGNMENT_ID = T.ASSIGNMENT_ID) WHERE STUDENT_ID = :user_id AND SUBMISSION_STATUS = 1`;
    const binds = { user_id: user_id, team_id: team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getAllAssignmentsForInstructor(user_id) {
    const sql = `SELECT * FROM ASSIGNMENTS WHERE CREATED_BY = :user_id`;
    const binds = { user_id: user_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getAllAssignmentsForInstructorInTeam(user_id, team_id) {
    const sql = `SELECT * FROM ASSIGNMENTS WHERE CREATED_BY = :user_id AND TEAM_ID = :team_id`;
    const binds = { user_id: user_id, team_id: team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getAllAssignmentsInTeam(team_id) {
    const sql = `SELECT * FROM ASSIGNMENTS WHERE TEAM_ID = :team_id`;
    const binds = { team_id: team_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getAssignmentById(ass_id) {
    const sql = `
    select

       ASSIGNMENT_ID, ASSIGNMENT_TITLE, ASSIGNMENT_DESC, CREATED_BY, TEAM_ID, FILE_URL,
       TRUNC(DEADLINE - SYSDATE) as DAYS,
       TRUNC(MOD((DEADLINE - SYSDATE) * 24,24) ) as HOURS,
       TRUNC(MOD((DEADLINE - SYSDATE) * 1440, 60) ) as MINS,
       (case when (DEADLINE - SYSDATE) < 0 then 1 else 0 end) as DUE
from ASSIGNMENTS where ASSIGNMENT_ID=:ass_id
    `;
    const binds = { ass_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function createAssignment(
    team_id,
    ass_title,
    ass_desc,
    created_by,
    file_path,
    deadline_date
) {
    const sql = `begin
    create_assignment(:team_id, :ass_title, :ass_desc, :created_by, :file_path, TO_DATE(:deadline_date, 'YYYY-MM-DD HH24:MI'));
end;`;
    const binds = {
        team_id,
        ass_title,
        ass_desc,
        created_by,
        file_path,
        deadline_date,
    };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function submitAssignment(ass_id, std_id, file_path) {
    sql = `UPDATE ASSIGNED_TO SET SUBMISSION_STATUS=1, SUBMISSION_FILE=:file_path where ASSIGNMENT_ID=:ass_id and STUDENT_ID=:std_id`;
    const binds = { ass_id, std_id, file_path };
    return (await db.execute(sql, binds, db.options)).rows;
}

async function getSubmissionStatus(ass_id, std_id) {
    const sql = `SELECT * from ASSIGNED_TO where ASSIGNMENT_ID=:ass_id and STUDENT_ID=:std_id`;
    const binds = { ass_id, std_id };
    return (await db.execute(sql, binds, db.options)).rows;
}
async function deleteAssignment(ass_id) {
    const sql = `DELETE FROM ASSIGNMENTS WHERE ASSIGNMENT_ID=:ass_id`;
    const binds = { ass_id };
    return (await db.execute(sql, binds, db.options)).rows;
}

module.exports = {
    getAllNewAssignmentsForStudent,
    getAllNewAssignmentsForStudentInTeam,
    getAllCompletedAssignmentsForStudent,
    getAllCompletedAssignmentsForStudentInTeam,
    getAllAssignmentsForInstructor,
    getAllAssignmentsForInstructorInTeam,
    getAllAssignmentsInTeam,
    createAssignment,
    getAssignmentById,
    submitAssignment,
    getSubmissionStatus,
    deleteAssignment,
};
