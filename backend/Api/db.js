const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',          
  password: '1234',     
  database: 'ecommerce_db' 
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar con MySQL:', err);
  } else {
    console.log('Conexión exitosa a MySQL');
  }
});

module.exports = db;
