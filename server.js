const mysql = require("mysql2");

const pool = mysql.createPool({
  // host: "localhost",
  host: "172.16.16.29",
  user: "root",
  password: "",
  database: "margrisha",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();
