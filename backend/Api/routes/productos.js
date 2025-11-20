const express = require('express');
const router = express.Router();
const db = require('../db');

// 👉 Obtener todos los productos
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      id_producto,
      nombre,
      precio_unitario,
      stock_actual
    FROM Productos;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
