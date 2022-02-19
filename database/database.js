const oracledb = require("oracledb");
require("dotenv").config();

oracledb.autoCommit = true;

const database_options = {
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	connectString: process.env.DB_CONNECTSTRING,
};

async function startup() {
	console.log("Initializing database");
	const pool = await oracledb.createPool(database_options);
	connection = await oracledb.getConnection();
	connection.close();
	await initializeProcedures();
	console.log("Database Initialized Successfully");
}

async function shutdown() {
	console.log("Shutting down database");
	try {
		await oracledb.getPool().close(10);
		console.log("Pools Closed");
	} catch (err) {
		console.log("Error : function shutdown()");
	}
}

async function execute(sqlCommand, bindParams, options) {
	let connection, results;

	try {
		connection = await oracledb.getConnection();
		results = await connection.execute(sqlCommand, bindParams, options);
	} catch (err) {
		console.log(
			"Error : function execute(" +
				sqlCommand +
				") [Message : " +
				err.message +
				" ]"
		);
	} finally {
		if (connection) {
			try {
				await connection.close();
			} catch (err) {
				console.log(
					"Error : function execute() while closing connection : " +
						err.message
				);
			}
		}
	}
	return results;
}

async function executeMany(sqlCommand, bindParams, options) {
	let connection;

	try {
		connection = await oracledb.getConnection();
	} catch (err) {
		console.log(
			"Error : function executeMany(" +
				sqlCommand +
				") [Message : " +
				err.message +
				" ]"
		);
	} finally {
		if (connection) {
			try {
				await connection.close();
			} catch (err) {
				console.log(
					"Error : function executeMany() while closing connection : " +
						err.message
				);
			}
		}
	}
}

async function initializeProcedures() {
	const team_notification = `create or replace procedure create_team_notification(team_id in NUMBER, title in VARCHAR2, content in VARCHAR2)
IS
    nid Number;
begin
    insert into NOTIFICATION (TITLE, CONTENT) VALUES (title, content) returning NOTIFICATION_ID into nid;
    insert into NOTIFICATION_RECEIVED_BY_TEAM (TEAM_ID, NOTIFICATION_ID) values (team_id, nid);
end;`;
	await execute(team_notification, {}, options);

	const create_team = `
create or replace procedure create_team(team_name in varchar2, user_id in Number, team_code in varchar2, team_desc in varchar2, course_id in varchar2)
IS
    tid Number;
begin
    insert into TEAMS (TEAM_NAME, CREATED_BY, TEAM_CODE, TEAM_DESC, COURSE_ID) values (team_name, user_id, team_code, team_desc, course_id) returning TEAM_ID into tid;
    insert into DISCUSSION (TITLE, BODY, TEAM_ID, STATUS) VALUES ('GENERAL', 'General Discussion', tid, 1);
end;`;
	const create_assignment = `
create or replace procedure create_assignment(team_id_var in Number, title in varchar2, assignment_desc in varchar2,
 created_by in varchar2, file_path in varchar2, deadline in DATE)
is
    ass_id Number;
begin
    insert into ASSIGNMENTS (ASSIGNMENT_TITLE, ASSIGNMENT_DESC, CREATED_BY, TEAM_ID, DEADLINE, FILE_URL) values
        (title, assignment_desc, created_by, team_id_var, deadline, file_path) returning ASSIGNMENT_ID into ass_id;
    insert into ASSIGNED_TO (ASSIGNMENT_ID, STUDENT_ID, SUBMISSION_STATUS)
        select ass_id, P.USER_ID, 0 from PARTICIPANT P
            where P.ROLE = 'general' and P.TEAM_ID = team_id_var;
end;
    `;

	await execute(create_team, {}, options);
	await execute(create_assignment, {}, options);

	console.log("Procedure Initialized");
}

const options = {
	outFormat: oracledb.OUT_FORMAT_OBJECT,
};

module.exports = {
	startup,
	shutdown,
	execute,
	executeMany,
	options,
	initializeProcedures,
};
