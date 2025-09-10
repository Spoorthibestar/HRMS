const mysql = require('mysql2/promise'); // Note: Using promise version

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'spoorthi',
  database: 'CompanyDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database!');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

module.exports = pool;