const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',           // tu usuario de MySQL
  password: '1234',       // tu contraseña de MySQL
  database: 'e_commerce_estadistica'  //  nombre correcto de tu base
});

db.connect(err => {
  if (err) {
    console.error(' Error al conectar con MySQL:', err);
  } else {
    console.log(' Conexión exitosa a MySQL');
  }
});

module.exports = db;
