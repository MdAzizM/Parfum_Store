const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "database.db");
const initSqlPath = path.join(__dirname, "init.sql");

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("SQLite connection error:", err.message);
    } else {
        console.log("SQLite connected at:", dbPath);

        // Run init.sql to create tables
        const initSql = fs.readFileSync(initSqlPath, "utf8");
        db.exec(initSql, (err) => {
            if (err) console.error("Error running init SQL:", err.message);
            else console.log("Database tables ready");
        });
    }
});

module.exports = db;
