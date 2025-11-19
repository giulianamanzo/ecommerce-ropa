const express = require('express');
const router = express.Router();
const db = require('../db');

// 👉 Promedio del total de ventas
router.get('/promedio', (req, res) => {
  const sql = 'SELECT AVG(Total) AS PromedioVentas FROM Ventas';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
});

// 👉 Desvío estándar del total de ventas
router.get('/desvio', (req, res) => {
  const sql = 'SELECT STDDEV(Total) AS DesvioVentas FROM Ventas';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
});

// 👉 Ventas agrupadas por categoría
router.get('/por-categoria', (req, res) => {
  const sql = `
    SELECT c.Nombre_Categoria, SUM(v.Total) AS TotalVentas
    FROM Ventas v
    JOIN Productos p ON v.ID_Producto = p.ID_Producto
    JOIN Categorias c ON p.ID_Categoria = c.ID_Categoria
    GROUP BY c.Nombre_Categoria
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 👉 Correlación entre precio y cantidad
router.get('/correlacion', (req, res) => {
  const sql = 'SELECT CORR(Precio_Unitario, Cantidad) AS Correlacion FROM Ventas';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
});

module.exports = router;
