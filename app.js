require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware เพื่อให้ Express อ่าน JSON ได้

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


app.get('/products', (req, res) => {
  pool.query('SELECT * FROM products WHERE deleted = 0')
    .then(([rows]) => res.json(rows));
});

app.get('/products/:id', (req, res) => {
  pool.query('SELECT * FROM products WHERE id = ? AND deleted = 0', [req.params.id])
    .then(([rows]) => {
      if (rows.length > 0) res.json(rows[0]);
      else res.status(404).json({ message: 'Product not found' });
    });
});

app.get('/products/search/:keyword', (req, res) => {
  const keyword = `%${req.params.keyword}%`;
  pool.query('SELECT * FROM products WHERE name LIKE ? AND deleted = 0', [keyword])
    .then(([rows]) => res.json(rows));
});


app.post('/products', async (req, res) => {
  const { name, price, discount, review_count, image_url } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, price, discount, review_count, image_url, deleted) VALUES (?, ?, ?, ?, ?, 0)',
      [name, price, discount, review_count, image_url]
    );
    res.status(201).json({ id: result.insertId, name, price, discount, review_count, image_url });
  } catch (err) {
    res.status(500).json({ message: 'Insert failed', error: err });
  }
});



app.put('/products/:id', async (req, res) => {
  const { name, price, discount, review_count, image_url } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE products SET name = ?, price = ?, discount = ?, review_count = ?, image_url = ? WHERE id = ? AND deleted = 0',
      [name, price, discount, review_count, image_url, req.params.id]
    );
    if (result.affectedRows > 0) res.json({ message: 'Product updated' });
    else res.status(404).json({ message: 'Product not found or deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err });
  }
});


app.delete('/products/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE products SET deleted = 1 WHERE id = ? AND deleted = 0',
      [req.params.id]
    );
    if (result.affectedRows > 0) res.json({ message: 'Product soft deleted' });
    else res.status(404).json({ message: 'Product not found or already deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err });
  }
});

app.put('/products/restore/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE products SET deleted = 0 WHERE id = ? AND deleted = 1',
      [req.params.id]
    );
    if (result.affectedRows > 0) res.json({ message: 'Product restored' });
    else res.status(404).json({ message: 'Product not found or not deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Restore failed', error: err });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
