require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); 

const app = express();
const PORT = 3000;
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


app.get('/', (req, res) => {
  res.send('API Server is running!');
});


app.get('/products', (req, res) => {
  pool.query('SELECT * FROM products')
    .then(([rows]) => {
      res.json(rows);
    });
});

app.get('/products/:id', (req, res) => {
  pool.query('SELECT * FROM products WHERE id = ?', [req.params.id])
    .then(([rows]) => {
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    });
});

app.get('/products/search/:keyword', (req, res) => {
  const keyword = `%${req.params.keyword}%`;
  pool.query('SELECT * FROM products WHERE name LIKE ?', [keyword])
    .then(([rows]) => {
      res.json(rows);
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

