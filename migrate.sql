-- Migración de base de datos para Talking Children
USE talking_children;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Tabla de categorías de mensajes
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#000000',
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de mensajes con TTS
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text TEXT NOT NULL,
  audio_url VARCHAR(500),
  category_id INT NOT NULL,
  created_by INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabla de relación tutor-niño (muchos a muchos)
CREATE TABLE IF NOT EXISTS tutor_child_relations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tutor_id INT NOT NULL,
  child_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_id) REFERENCES users(id),
  FOREIGN KEY (child_id) REFERENCES users(id),
  UNIQUE KEY unique_relation (tutor_id, child_id)
);

-- Tabla de mensajes asignados a niños
CREATE TABLE IF NOT EXISTS child_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  message_id INT NOT NULL,
  assigned_by INT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES users(id),
  FOREIGN KEY (message_id) REFERENCES messages(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  UNIQUE KEY unique_assignment (child_id, message_id)
);

-- Insertar roles del sistema (solo si no existen)
INSERT IGNORE INTO roles (name, description) VALUES 
('administrador', 'Acceso completo al sistema, gestión de usuarios y configuración'),
('tutor', 'Puede gestionar niños, crear mensajes y categorías'),
('niño', 'Puede escuchar mensajes asignados y reproducir audios');

-- Insertar categorías básicas (solo si no existen)
INSERT IGNORE INTO categories (name, description, color, icon) VALUES 
('Saludos', 'Mensajes de saludo y despedida', '#4CAF50', 'waving-hand'),
('Emociones', 'Expresión de sentimientos y emociones', '#2196F3', 'heart'),
('Necesidades', 'Comunicación de necesidades básicas', '#FF9800', 'help'),
('Familia', 'Mensajes relacionados con la familia', '#9C27B0', 'family'),
('Emergencia', 'Mensajes de urgencia o emergencia', '#F44336', 'emergency');
