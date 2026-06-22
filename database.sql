CREATE DATABASE IF NOT EXISTS sistema_policiaco
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sistema_policiaco;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (nombre) VALUES
('Administrador'),
('Policia'),
('Marina'),
('Guardia Nacional'),
('Ciudadano');

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NOT NULL,
    usuario VARCHAR(80) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    estado ENUM('Activo','Suspendido','Baja') DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE ciudadanos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    id_ciudadano VARCHAR(30) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    fecha_nacimiento DATE NULL,
    fotografia VARCHAR(255) NULL,
    estado ENUM('Activo','Suspendido','Investigado') DEFAULT 'Activo',
    observaciones TEXT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE corporaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE
);

INSERT INTO corporaciones (nombre) VALUES
('Policia'),
('Marina'),
('Guardia Nacional');

CREATE TABLE personal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    corporacion_id INT NOT NULL,
    id_interno VARCHAR(30) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    placa_matricula VARCHAR(80) NULL,
    rango VARCHAR(80) NULL,
    zona_asignada VARCHAR(120) NULL,
    fotografia VARCHAR(255) NULL,
    estado ENUM('Activo','Suspendido','Baja') DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (corporacion_id) REFERENCES corporaciones(id)
);

CREATE TABLE infracciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(40) NOT NULL UNIQUE,
    ciudadano_id INT NOT NULL,
    personal_id INT NOT NULL,
    motivo VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    estado ENUM('Activa','Archivada','Cancelada') DEFAULT 'Activa',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ciudadano_id) REFERENCES ciudadanos(id),
    FOREIGN KEY (personal_id) REFERENCES personal(id)
);

CREATE TABLE historial_acciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(80) NULL,
    registro_id INT NULL,
    descripcion TEXT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);


Usuario: admin
Contraseña: admin123