require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// เชื่อมต่อฐานข้อมูล
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

// Route หน้าหลัก
app.get('/', (req, res) => {
  res.send('API Server is running!');
});

// Endpoint GET /products
app.get('/products', (req, res) => {
  pool.query('SELECT * FROM products')
    .then(([rows]) => res.json(rows))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

// Endpoint GET /products/:id
app.get('/products/:id', (req, res) => {
  pool.query('SELECT * FROM products WHERE id = ?', [req.params.id])
    .then(([rows]) => {
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

// Endpoint GET /products/search/:keyword
app.get('/products/search/:keyword', (req, res) => {
  const keyword = `%${req.params.keyword}%`;
  pool.query('SELECT * FROM products WHERE name LIKE ?', [keyword])
    .then(([rows]) => res.json(rows))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

// เปิด Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
