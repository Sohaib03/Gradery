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

    const user_notification = `CREATE OR REPLACE FUNCTION CREATE_USER_NOTIFICATION(user_id IN NUMBER, title IN VARCHAR2, content IN VARCHAR2)
    RETURN NUMBER IS
    nid NUMBER;
BEGIN
    insert into NOTIFICATION (TITLE, CONTENT) VALUES (title, content) returning NOTIFICATION_ID into nid;
    insert into NOTIFICATION_RECEIVED_BY_USER (USER_ID, NOTIFICATION_ID) values (user_id, nid);
    return nid;
END;`;
    await execute(user_notification, {}, options);

    const invitation_notification = `CREATE OR REPLACE TRIGGER INVITATION_NOTIFICATION
    AFTER INSERT
    ON INVITATION
    FOR EACH ROW
DECLARE
    title   VARCHAR2(100);
    notif_content VARCHAR2(500);
    t_id    NUMBER;
    t_name  VARCHAR2(100);
    u_id    NUMBER;
    u_name  VARCHAR2(100);
    r       VARCHAR2(20);
    i_id    NUMBER;
    i_name  VARCHAR2(100);
    t_code  VARCHAR2(100);
    n_id    NUMBER;
BEGIN
    t_id := :NEW.TEAM_ID;
    SELECT TEAM_NAME INTO t_name FROM TEAMS T WHERE T.TEAM_ID = t_id;
    SELECT TEAM_CODE INTO t_code FROM TEAMS T WHERE T.TEAM_ID = t_id;
    u_id := :NEW.USER_ID;
    SELECT USERNAME INTO u_name FROM USERS U WHERE U.USER_ID = u_id;

    r := :NEW.ROLE;

    i_id := :NEW.INVITED_BY;
    SELECT USERNAME INTO i_name FROM USERS U WHERE U.USER_ID = i_id;

    title := 'Invitation to join ' || t_name;
    notif_content := 'Dear ' || u_name || ', you are invited by ' ||
               i_name || ' to join ' || t_name || ' as ' || r ||
               '.<br>';
    n_id := CREATE_USER_NOTIFICATION(u_id, title, '');
    notif_content := notif_content || '<form action="/teams/join/' || t_code || '/' || n_id || '/accept" method="POST">
    <button class="button is-primary is-small" type="submit">Accept</button>
    <button
        class="button is-danger is-small"
        type="submit"
        formaction="/teams/join/' || t_code || '/' || n_id || '/decline"
    >
        Decline
    </button>
</form>';
    UPDATE NOTIFICATION N SET N.CONTENT = notif_content WHERE N.NOTIFICATION_ID = n_id;
END;`;

    await execute(invitation_notification, {}, options);

    const add_participant_delete_invitation = `CREATE OR REPLACE TRIGGER ADD_PARTICIPANT_DELETE_INVITATION
    AFTER INSERT
    ON PARTICIPANT
    FOR EACH ROW
    BEGIN
        DELETE FROM INVITATION I WHERE I.USER_ID = :NEW.USER_ID AND I.TEAM_ID = :NEW.TEAM_ID ;
    END;`;
    await execute(add_participant_delete_invitation, {}, options);

    const create_team = `
create or replace procedure create_team(team_name in varchar2, user_id in Number, team_code in varchar2, team_desc in varchar2, course_id in varchar2)
IS
    tid Number;
begin
    insert into TEAMS (TEAM_NAME, CREATED_BY, TEAM_CODE, TEAM_DESC, COURSE_ID) values (team_name, user_id, team_code, team_desc, course_id) returning TEAM_ID into tid;
    insert into DISCUSSION (TITLE, BODY, TEAM_ID, STATUS) VALUES ('GENERAL', 'General Discussion', tid, 1);
end;`;
    await execute(create_team, {}, options);

    const create_assignment = `
create or replace procedure create_assignment(team_id_var in Number, title in varchar2, assignment_desc in varchar2,
 created_by in NUMBER, file_path in varchar2, deadline in DATE)
is
    ass_id Number;
begin
    insert into ASSIGNMENTS (ASSIGNMENT_TITLE, ASSIGNMENT_DESC, CREATED_BY, TEAM_ID, DEADLINE, FILE_URL) values
        (title, assignment_desc, created_by, team_id_var, deadline, file_path) returning ASSIGNMENT_ID into ass_id;
    insert into ASSIGNED_TO (ASSIGNMENT_ID, STUDENT_ID, SUBMISSION_STATUS)
        select ass_id, P.USER_ID, 0 from PARTICIPANT P
            where P.ROLE = 'student' and P.TEAM_ID = team_id_var;
end;
    `;

    await execute(create_assignment, {}, options);

    const pending_assignments_for_new_user = `CREATE OR REPLACE TRIGGER ASSIGN_PENDING_ASSIGNMENTS_TO_NEW_USER
        AFTER INSERT
        ON PARTICIPANT
        FOR EACH ROW
        WHEN (NEW.ROLE = 'student')
    DECLARE
    BEGIN
        FOR R IN (SELECT * FROM ASSIGNMENTS WHERE TEAM_ID = :NEW.TEAM_ID AND DEADLINE > SYSDATE)
            LOOP
                INSERT INTO ASSIGNED_TO (ASSIGNMENT_ID, STUDENT_ID, SUBMISSION_STATUS, SUBMISSION_FILE, SCORE)
                VALUES (R.ASSIGNMENT_ID, :NEW.USER_ID, 0, null, null);
            END LOOP;
    END ;`;

    await execute(pending_assignments_for_new_user, {}, options);

    const delete_assigned_assignments_of_left_user = `CREATE OR REPLACE TRIGGER DELETE_ASSIGNED_ASSIGNMENTS_OF_LEFT_USER
        AFTER DELETE
        ON PARTICIPANT
        FOR EACH ROW
        WHEN (OLD.ROLE = 'student')
    BEGIN
        DELETE FROM ASSIGNED_TO WHERE STUDENT_ID = :OLD.USER_ID ;
    END;`;
    await execute(delete_assigned_assignments_of_left_user, {}, options);

    const notify_when_assigned = `CREATE OR REPLACE TRIGGER NOTIFY_WHEN_ASSIGNED
    AFTER INSERT
    ON ASSIGNED_TO
    FOR EACH ROW
DECLARE
    nid              NUMBER := 0;
    notif_title      VARCHAR2(100) := '';
    notif_content    VARCHAR2(500) := '';
    t_name        VARCHAR2(100) := '';
    t_id          NUMBER := 0;
    s_id       NUMBER;
    a_id    NUMBER;
    a_title VARCHAR2(200) := '';
    c_name     VARCHAR2(100) := '';
    c_id       NUMBER := 1;
    d_line         DATE;
BEGIN
    s_id := :NEW.STUDENT_ID;
    a_id := :NEW.ASSIGNMENT_ID;

    SELECT TEAM_ID
    INTO t_id
    FROM ASSIGNMENTS
    WHERE ASSIGNMENT_ID = a_id;

    SELECT TEAM_NAME
    INTO t_name
    FROM TEAMS
    WHERE TEAM_ID = t_id;

    SELECT ASSIGNMENT_TITLE
    INTO a_title
    FROM ASSIGNMENTS
    WHERE ASSIGNMENT_ID = a_id;

    SELECT CREATED_BY
    INTO c_id
    FROM ASSIGNMENTS
    WHERE ASSIGNMENT_ID = a_id;

    SELECT USERNAME
    INTO c_name
    FROM USERS
    WHERE USER_ID = c_id;

    notif_title := 'New assignment on ' || t_name;
    notif_content := 'Database ' || a_title || '<br>' ||
                     'Created by: ' || c_name || '<br>' ||
                     'Deadline: ' || d_line;
    nid := CREATE_USER_NOTIFICATION(:NEW.STUDENT_ID, notif_title, notif_content);
end;`;
    await execute(notify_when_assigned, {}, options);
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
