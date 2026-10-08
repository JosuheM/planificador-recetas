-- Esquema del Planificador de recetas.
-- En local: crea la BD 'planificador' y ejecuta este archivo.
-- En Hostinger: importa este archivo en phpMyAdmin sobre la BD que creaste en hPanel
-- (en ese caso borra/ignora las dos primeras sentencias CREATE DATABASE / USE).

CREATE DATABASE IF NOT EXISTS planificador CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE planificador;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recetas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(50) NOT NULL DEFAULT 'General',
  pasos TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ingredientes_receta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receta_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  unidad VARCHAR(20) NOT NULL DEFAULT 'g',
  FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS plan_semanal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  dia TINYINT NOT NULL,                              -- 0 = lunes ... 6 = domingo
  comida ENUM('desayuno','almuerzo','cena') NOT NULL,
  receta_id INT NOT NULL,
  UNIQUE KEY uq_slot (usuario_id, dia, comida),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lista_compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  ingrediente VARCHAR(100) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  unidad VARCHAR(20) NOT NULL,
  comprado TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;
