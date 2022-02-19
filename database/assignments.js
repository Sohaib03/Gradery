const db = require("./database");

async function getAllNewAssignmentsForStudent(user_id) {
	const sql = `SELECT * FROM ASSIGNED_TO WHERE STUDENT_ID = :user_id AND SUBMISSION_STATUS = 0`;
	const binds = { user_id: user_id };
	return (await db.execute(sql, binds, db.options)).rows;
}

async function getAllNewAssignmentsForStudentInTeam(user_id, team_id) {
	const sql = `SELECT * FROM ASSIGNED_TO T JOIN (SELECT ASSIGNMENT_ID FROM ASSIGNMENTS WHERE TEAM_ID = :team_id) A ON (A.ASSIGNMENT_ID = T.ASSIGNMENT_ID) WHERE STUDENT_ID = :user_id AND SUBMISSION_STATUS = 0`;
	const binds = { user_id: user_id, team_id: team_id };
	return (await db.execute(sql, binds, db.options)).rows;
}

async function getAllCompletedAssignmentsForStudent(user_id) {
	const sql = `SELECT * FROM ASSIGNED_TO WHERE STUDENT_ID = :user_id AND SUBMISSION_STATUS = 1`;
	const binds = { user_id: user_id };
	return (await db.execute(sql, binds, db.options)).rows;
}

async function getAllCompletedAssignmentsForStudentInTeam(user_id, team_id) {
	const sql = `SELECT * FROM ASSIGNED_TO T JOIN (SELECT ASSIGNMENT_ID FROM ASSIGNMENTS WHERE TEAM_ID = :team_id) A ON (A.ASSIGNMENT_ID = T.ASSIGNMENT_ID) WHERE STUDENT_ID = :user_id AND SUBMISSION_STATUS = 1`;
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

module.exports = {
	getAllNewAssignmentsForStudent,
	getAllNewAssignmentsForStudentInTeam,
	getAllCompletedAssignmentsForStudent,
	getAllCompletedAssignmentsForStudentInTeam,
	getAllAssignmentsForInstructor,
	getAllAssignmentsForInstructorInTeam,
};
