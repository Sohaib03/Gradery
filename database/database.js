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
    const fs = require("fs");

    try {
        const initSQL = fs.readFileSync("initSQL.sql", "utf8");
        await execute(initSQL, {}, options);
        console.log("Procedure Initialized");
    } catch (err) {
        console.error(err);
    }
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
