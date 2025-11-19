-- ============================================
-- BASE DE DATOS: e_commerce_estadistica
-- ============================================

CREATE DATABASE IF NOT EXISTS e_commerce_estadistica;
USE e_commerce_estadistica;

-- ============================================
-- 1️⃣ TABLA: CATEGORIAS
-- ============================================
CREATE TABLE Categorias (
    ID_Categoria INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_Categoria VARCHAR(100) NOT NULL,
    Descripcion VARCHAR(255)
);

-- ============================================
-- 2️⃣ TABLA: CLIENTES
-- ============================================
CREATE TABLE Clientes (
    ID_Cliente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL,
    Correo VARCHAR(150) UNIQUE,
    Celular VARCHAR(20),
    Ciudad VARCHAR(100),
    Edad INT
);

-- ============================================
-- 3️⃣ TABLA: PRODUCTOS
-- ============================================
CREATE TABLE Productos (
    ID_Producto INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(150) NOT NULL,
    ID_Categoria INT,
    Precio_Unitario DECIMAL(10,2) NOT NULL,
    Stock_Actual INT DEFAULT 0,
    Disponible BOOLEAN GENERATED ALWAYS AS (Stock_Actual > 0) STORED,
    FOREIGN KEY (ID_Categoria) REFERENCES Categorias(ID_Categoria)
);

-- ============================================
-- 4️⃣ TABLA: VENTAS
-- ============================================
CREATE TABLE Ventas (
    ID_Venta INT AUTO_INCREMENT PRIMARY KEY,
    Fecha DATE NOT NULL,
    ID_Cliente INT,
    ID_Producto INT,
    Cantidad INT NOT NULL,
    Precio_Unitario DECIMAL(10,2) NOT NULL,
    Total DECIMAL(10,2) GENERATED ALWAYS AS (Cantidad * Precio_Unitario) STORED,
    FOREIGN KEY (ID_Cliente) REFERENCES Clientes(ID_Cliente),
    FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
);

-- ============================================
-- 5️⃣ TABLA: MOVIMIENTOS DE STOCK
-- ============================================
CREATE TABLE MovimientosStock (
    ID_Movimiento INT AUTO_INCREMENT PRIMARY KEY,
    ID_Producto INT,
    Fecha DATE NOT NULL,
    Tipo_Movimiento ENUM('INGRESO', 'EGRESO') NOT NULL,
    Cantidad_Movida INT NOT NULL,
    Stock_Disponible INT NOT NULL,
    Descripcion VARCHAR(255),
    FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
);
USE e_commerce_estadistica;
INSERT INTO Categorias (Nombre_Categoria, Descripcion) VALUES
('Electrónica', 'Productos tecnológicos y gadgets'),
('Hogar', 'Electrodomésticos y artículos para el hogar'),
('Indumentaria', 'Ropa y accesorios'),
('Deportes', 'Artículos deportivos y de fitness'),
('Juguetería', 'Juguetes y juegos para todas las edades');

INSERT INTO Clientes (Nombre, Apellido, Correo, Celular, Ciudad, Edad) VALUES
('Ana', 'Pérez', 'ana.perez@mail.com', '1122334455', 'Buenos Aires', 35),
('Carlos', 'Gómez', 'carlos.gomez@mail.com', '1199887766', 'Córdoba', 42),
('Lucía', 'Martínez', 'lucia.martinez@mail.com', '1166543322', 'Rosario', 29),
('Mariano', 'López', 'mariano.lopez@mail.com', '1134578899', 'Mendoza', 38),
('Sofía', 'Díaz', 'sofia.diaz@mail.com', '1156981234', 'La Plata', 33),
('Pablo', 'Rivas', 'pablo.rivas@mail.com', '1123456677', 'Tucumán', 27),
('Laura', 'Fernández', 'laura.fernandez@mail.com', '1178994455', 'Salta', 46),
('Martina', 'Ruiz', 'martina.ruiz@mail.com', '1145627890', 'Santa Fe', 30),
('Hernán', 'Vega', 'hernan.vega@mail.com', '1188776655', 'Mar del Plata', 41),
('Carolina', 'Benítez', 'caro.benitez@mail.com', '1199322211', 'Neuquén', 36);

INSERT INTO Productos (Nombre, ID_Categoria, Precio_Unitario, Stock_Actual) VALUES
('Notebook HP 15', 1, 550000.00, 12),
('Smartphone Samsung A35', 1, 300000.00, 15),
('Auriculares Bluetooth', 1, 40000.00, 30),
('Televisor 50" LG', 1, 600000.00, 5),
('Licuadora Philips', 2, 65000.00, 8),
('Aspiradora Atma', 2, 90000.00, 10),
('Cafetera Oster', 2, 85000.00, 7),
('Campera deportiva Adidas', 3, 120000.00, 25),
('Zapatillas Nike Air', 3, 220000.00, 18),
('Buzo Puma', 3, 90000.00, 15),
('Pelota de fútbol Adidas', 4, 55000.00, 20),
('Bicicleta MTB', 4, 350000.00, 4),
('Mancuernas 5kg', 4, 30000.00, 25),
('Monopatín eléctrico', 4, 480000.00, 3),
('Muñeca Barbie', 5, 35000.00, 12),
('Juego de mesa UNO', 5, 15000.00, 30),
('LEGO City', 5, 90000.00, 10),
('Peluche Oso', 5, 25000.00, 20),
('Tablet Lenovo 10"', 1, 250000.00, 8),
('Monitor Samsung 24"', 1, 180000.00, 9);

INSERT INTO Ventas (Fecha, ID_Cliente, ID_Producto, Cantidad, Precio_Unitario)
VALUES
('2025-10-01', 1, 1, 1, 550000.00),
('2025-10-01', 2, 2, 2, 300000.00),
('2025-10-02', 3, 5, 1, 65000.00),
('2025-10-02', 4, 8, 1, 120000.00),
('2025-10-03', 5, 11, 3, 55000.00),
('2025-10-03', 6, 3, 2, 40000.00),
('2025-10-03', 7, 15, 1, 35000.00),
('2025-10-04', 8, 9, 1, 220000.00),
('2025-10-04', 9, 16, 2, 15000.00),
('2025-10-05', 10, 19, 1, 250000.00),
('2025-10-06', 1, 1, 1, 550000.00),
('2025-10-06', 3, 5, 2, 65000.00),
('2025-10-07', 2, 10, 1, 90000.00),
('2025-10-07', 5, 13, 2, 30000.00),
('2025-10-08', 7, 18, 1, 25000.00),
('2025-10-09', 8, 14, 1, 480000.00),
('2025-10-09', 9, 12, 1, 350000.00),
('2025-10-10', 10, 4, 1, 600000.00),
('2025-10-11', 4, 2, 1, 300000.00),
('2025-10-11', 6, 8, 2, 120000.00);

INSERT INTO MovimientosStock (ID_Producto, Fecha, Tipo_Movimiento, Cantidad_Movida, Stock_Disponible, Descripcion)
VALUES
(1, '2025-09-25', 'INGRESO', 10, 12, 'Reposición de notebooks HP'),
(2, '2025-09-25', 'INGRESO', 15, 15, 'Ingreso de smartphones'),
(3, '2025-09-25', 'INGRESO', 30, 30, 'Compra de auriculares'),
(5, '2025-09-25', 'INGRESO', 10, 8, 'Lote de licuadoras'),
(8, '2025-09-25', 'INGRESO', 25, 25, 'Indumentaria deportiva'),
(9, '2025-09-25', 'INGRESO', 20, 18, 'Zapatillas nuevas'),
(11, '2025-09-25', 'INGRESO', 20, 20, 'Pelotas de fútbol'),
(15, '2025-09-25', 'INGRESO', 15, 12, 'Muñecas nuevas'),
(16, '2025-09-25', 'INGRESO', 40, 30, 'Juegos de mesa UNO'),
(19, '2025-09-25', 'INGRESO', 8, 8, 'Tablets Lenovo 10"'),
(1, '2025-10-01', 'EGRESO', 1, 11, 'Venta de Notebook HP'),
(2, '2025-10-01', 'EGRESO', 2, 13, 'Venta de smartphones'),
(5, '2025-10-02', 'EGRESO', 1, 7, 'Venta de licuadora'),
(8, '2025-10-02', 'EGRESO', 1, 24, 'Venta de campera'),
(11, '2025-10-03', 'EGRESO', 3, 17, 'Venta de pelotas'),
(9, '2025-10-04', 'EGRESO', 1, 17, 'Venta de zapatillas'),
(16, '2025-10-04', 'EGRESO', 2, 28, 'Venta de juegos de mesa'),
(19, '2025-10-05', 'EGRESO', 1, 7, 'Venta de tablet'),
(14, '2025-10-09', 'EGRESO', 1, 2, 'Venta de monopatín'),
(12, '2025-10-09', 'EGRESO', 1, 3, 'Venta de bicicleta');

SELECT * FROM categorias ;
SELECT * FROM clientes ;
SELECT * FROM productos ;
SELECT * FROM VENTAS ;
SELECT * FROM MovimientosStock;





