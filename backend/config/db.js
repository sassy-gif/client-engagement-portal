const mysql = require('mysql2/promise');
require('dotenv').config();

// Connection pool — reused across requests instead of opening a new
// connection every time. Standard practice for production apps.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;