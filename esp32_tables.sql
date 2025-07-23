-- Tabla para registrar reproducciones de mensajes desde diferentes fuentes
CREATE TABLE IF NOT EXISTS message_playbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    child_id INT NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source ENUM('web', 'mobile', 'esp32', 'esp32_sequence', 'api') DEFAULT 'web',
    ip_address VARCHAR(45),
    user_agent TEXT,
    duration_seconds INT,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_message_playbacks_message (message_id),
    INDEX idx_message_playbacks_child (child_id),
    INDEX idx_message_playbacks_played_at (played_at)
);

-- Tabla para registrar eventos del ESP32
CREATE TABLE IF NOT EXISTS esp32_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type ENUM('connection', 'disconnection', 'button_press', 'battery_update', 'category_change', 'heartbeat', 'error') NOT NULL,
    device_id VARCHAR(100) DEFAULT 'TalkingChildren',
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_esp32_events_type (event_type),
    INDEX idx_esp32_events_created_at (created_at)
);

-- Tabla para almacenar configuraciones del ESP32
CREATE TABLE IF NOT EXISTS esp32_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insertar configuraciones por defecto del ESP32
INSERT IGNORE INTO esp32_settings (setting_key, setting_value, description) VALUES
('wifi_ssid', 'Tenda_627D40', 'SSID de la red WiFi para ESP32'),
('websocket_host', '192.168.0.189', 'IP del servidor WebSocket'),
('websocket_port', '8080', 'Puerto del servidor WebSocket'),
('auto_category_change_time', '300000', 'Tiempo en ms para cambio automático de categoría'),
('inactivity_timeout', '300000', 'Tiempo en ms antes de entrar en sleep mode'),
('heartbeat_interval', '60000', 'Intervalo en ms para envío de heartbeat'),
('volume_level', '30', 'Nivel de volumen por defecto (0-30)'),
('battery_low_threshold', '20', 'Porcentaje de batería considerado bajo'),
('battery_critical_threshold', '5', 'Porcentaje de batería considerado crítico');

-- Tabla para logs detallados de WebSocket
CREATE TABLE IF NOT EXISTS websocket_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(100),
    client_type ENUM('esp32', 'mobile', 'unknown') DEFAULT 'unknown',
    message_type VARCHAR(50),
    message_data JSON,
    direction ENUM('incoming', 'outgoing') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_websocket_logs_client (client_id),
    INDEX idx_websocket_logs_type (message_type),
    INDEX idx_websocket_logs_created_at (created_at)
);
