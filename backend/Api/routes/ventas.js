const express = require('express');
const router = express.Router();
const db = require('../db');

// 👉 Registrar una nueva venta
router.post('/', (req, res) => {
  const { id_cliente, id_producto, cantidad, precio_unitario, metodo_pago } = req.body;
  const total = cantidad * precio_unitario;
  const fecha = new Date();

  const sql = `INSERT INTO Ventas (Fecha, ID_Cliente, ID_Producto, Cantidad, Precio_Unitario, Total)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [fecha, id_cliente, id_producto, cantidad, precio_unitario, total], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: '✅ Venta registrada con éxito', id: result.insertId });
  });
});

// 👉 Obtener todas las ventas
router.get('/', (req, res) => {
  db.query("SELECT v.id_venta, v.id_cliente, v.id_producto, v.cantidad, v.precio AS precio_registrado, v.metodo_pago, v.fecha, p.id_producto AS producto_id, p.nombre AS producto_nombre, p.precio_unitario AS producto_precio_unitario FROM Ventas v JOIN Productos p ON v.id_producto = p.id_producto;", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
