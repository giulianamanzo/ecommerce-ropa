const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Permite que el frontend acceda a la API
app.use(cors());
app.use(express.json());

// Importamos las rutas
const ventasRouter = require('./routes/ventas');
const estadisticasRouter = require('./routes/estadisticas');
const productosRouter = require('./routes/productos')

// Asociamos las rutas
app.use('/ventas', ventasRouter);
app.use('/estadisticas', estadisticasRouter);
app.use('/productos', productosRouter)

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
