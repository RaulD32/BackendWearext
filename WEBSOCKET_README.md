# 🔌 WebSocket Integration - TalkingChildren ESP32

## 📋 Descripción General

Este sistema implementa comunicación en tiempo real entre:
- **ESP32 TalkingChildren** (dispositivo físico)
- **Aplicaciones móviles** (Android/iOS)
- **API Backend** (Node.js/Express)

## 🏗️ Arquitectura WebSocket

```
┌─────────────────┐    WebSocket     ┌─────────────────┐    HTTP API    ┌─────────────────┐
│   ESP32 Device  │ ◄──────────────► │  Node.js Server │ ◄────────────► │   Mobile Apps   │
│  TalkingChildren│                  │   (Port 8080)   │                │    Frontend     │
└─────────────────┘                  └─────────────────┘                └─────────────────┘
```

## 🤖 ESP32 Configuración

### Credenciales WiFi
```cpp
const char* WIFI_SSID = "Tenda_627D40";
const char* WIFI_PASSWORD = "BAn_2002!";
const char* WEBSOCKET_HOST = "192.168.0.189"; // IP de tu servidor
const int WEBSOCKET_PORT = 8080;
```

### Mensajes WebSocket del ESP32

#### 1. Conexión Initial
```json
{
  "type": "connection",
  "device": "TalkingChildren",
  "bootCount": 1,
  "battery": 85,
  "category": 1
}
```

#### 2. Presión de Botón
```json
{
  "type": "button_pressed",
  "button": 1,
  "category": 1,
  "timestamp": 1642248600000
}
```

#### 3. Estado de Batería
```json
{
  "type": "battery_status",
  "voltage": 3.8,
  "percentage": 75,
  "charging": false
}
```

#### 4. Heartbeat
```json
{
  "type": "heartbeat",
  "battery": 75
}
```

## 📱 Comandos hacia ESP32

### 1. Reproducir Audio
```json
{
  "command": "play",
  "button": 1
}
```

### 2. Cambiar Categoría
```json
{
  "command": "category",
  "category": 2
}
```

### 3. Solicitar Estado Batería
```json
{
  "command": "battery"
}
```

### 4. Apagar Dispositivo
```json
{
  "command": "shutdown"
}
```

## 🚀 API Endpoints WebSocket

### Estado de Conexiones
```http
GET /api/websocket/status
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "esp32Connected": true,
    "mobileClientsCount": 2,
    "esp32Status": {
      "battery": 85,
      "category": 1,
      "lastHeartbeat": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Enviar Comando al ESP32
```http
POST /api/websocket/send-command
Authorization: Bearer <token>
Content-Type: application/json

{
  "command": "play",
  "button": 1
}
```

### Broadcast a Todos los Clientes
```http
POST /api/websocket/broadcast
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "system_notification",
  "message": "Sistema actualizado",
  "data": {}
}
```

## 🎮 API Endpoints Control ESP32

### Reproducir Mensaje Específico
```http
POST /api/esp32/play-message/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "childId": 3
}
```

### Cambiar Categoría
```http
POST /api/esp32/change-category/2
Authorization: Bearer <token>
```

### Obtener Estado ESP32
```http
GET /api/esp32/status
Authorization: Bearer <token>
```

### Reproducir Secuencia de Categoría
```http
POST /api/esp32/play-category/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "childId": 3
}
```

### Sincronizar Favoritos
```http
POST /api/esp32/sync-favorites/3
Authorization: Bearer <token>
```

### Apagar ESP32 (Solo Admin)
```http
POST /api/esp32/shutdown
Authorization: Bearer <token>
```

## 🔧 Configuración del Servidor

### 1. Inicializar WebSocket
```javascript
import './controllers/websocketController.js';
```

### 2. Puerto WebSocket
- **Puerto**: 8080
- **Path**: `/ws`
- **URL**: `ws://localhost:8080/ws`

### 3. Variables de Entorno
```env
WEBSOCKET_PORT=8080
ESP32_DEFAULT_IP=192.168.0.189
```

## 📊 Base de Datos

### Tablas Nuevas
1. **message_playbacks** - Registro de reproducciones
2. **esp32_events** - Eventos del dispositivo
3. **esp32_settings** - Configuraciones
4. **websocket_logs** - Logs de comunicación

### Ejecutar Migraciones
```bash
mysql -u root -p wearext_db < esp32_tables.sql
```

## 🔍 Monitoreo y Logs

### Logs del Servidor
```bash
npm run dev
```

**Output esperado:**
```
🔌 WebSocket server iniciado en puerto 8080
🤖 ESP32 identificado - Boot: 1, Batería: 85%, Categoría: 1
📱 Cliente móvil identificado: Mobile App
🔊 Comando reproducir audio - Botón: 1
```

### Logs del ESP32
```
WiFi: Conectado
WebSocket inicializado
WebSocket conectado
Mensaje reproducido: Categoría 1, Botón 1
```

## 🚨 Resolución de Problemas

### ESP32 No Se Conecta
1. Verificar credenciales WiFi
2. Confirmar IP del servidor
3. Revisar puerto 8080 abierto
4. Verificar logs del servidor

### Comandos No Llegan al ESP32
1. Verificar estado de conexión WebSocket
2. Revisar formato de mensajes JSON
3. Confirmar ESP32 está escuchando
4. Verificar logs de errores

### Problemas de Batería
1. Verificar lecturas del ADC
2. Confirmar divisor de voltaje
3. Revisar configuración de USB
4. Monitorear modo sleep

## 📈 Métricas y Analytics

### Eventos Registrados
- Conexiones/desconexiones
- Presiones de botones
- Cambios de categoría
- Estados de batería
- Reproducciones de audio

### Dashboards Disponibles
- Estado en tiempo real del ESP32
- Historial de interacciones
- Estadísticas de batería
- Uso por categorías

## 🔐 Seguridad

### Autenticación
- Todos los endpoints requieren JWT
- Control de roles (admin/tutor/niño)
- Validación de permisos por operación

### Validaciones
- Formato de mensajes JSON
- Rango de valores (botones 1-3)
- Timeout de conexiones
- Rate limiting por cliente

## 📚 Documentación Swagger

Accede a la documentación interactiva:
```
http://localhost:3000/api-docs
```

**Secciones disponibles:**
- WebSocket (gestión de conexiones)
- ESP32 Control (control del dispositivo)
- Todas las APIs existentes documentadas

## 🎯 Casos de Uso

### 1. Reproducción Remota
App móvil → API → WebSocket → ESP32 → Audio

### 2. Monitoreo de Batería
ESP32 → WebSocket → API → Dashboard

### 3. Cambio de Categoría
App móvil → API → ESP32 → Nueva categoría

### 4. Sincronización de Favoritos
API → Base de datos → WebSocket → ESP32

## 🚀 Próximas Mejoras

- [ ] Reconexión automática WebSocket
- [ ] Compresión de mensajes
- [ ] Encriptación de comunicación
- [ ] Múltiples dispositivos ESP32
- [ ] Dashboard en tiempo real
- [ ] Notificaciones push
- [ ] Modo offline con sincronización

---

**¡El sistema WebSocket está completamente funcional y documentado!** 🎉
