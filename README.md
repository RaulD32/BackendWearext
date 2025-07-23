# Sistema TTS para Terapia del Habla Infantil

Backend completo en Node.js + TypeScript para asistir en la terapia del habla de niños con problemas de comunicación.

## 🎯 Características Principales

- **Sistema de Autenticación JWT** con roles específicos (administrador, tutor, niño)
- **Generación de Audio TTS** con voz femenina en español usando Windows PowerShell
- **Gestión Inteligente de Mensajes** con asignación personalizada a niños
- **Sistema de Relaciones** tutor-niño para seguimiento personalizado
- **API REST Completa** con validación robusta y manejo de errores
- **Control de Acceso por Roles** para seguridad y privacidad
- **Sistema de Favoritos** para niños y personalización de contenido

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js (v18 o superior)
- MySQL Server
- Windows (para funcionalidad TTS nativa)

### Configuración
```bash
# Clonar e instalar dependencias
npm install

# Configurar base de datos
# Ejecutar db.sql en MySQL

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor de desarrollo
npm run dev
```

## 📊 Estructura del Proyecto

```
src/
├── controllers/     # Controladores de API
├── services/        # Lógica de negocio
├── models/          # Modelos y DTOs
├── routes/          # Definición de rutas
├── middlewares/     # Middlewares de autenticación y validación
├── config/          # Configuración de BD y TTS
└── utils/           # Utilidades (hash, validaciones)
```

## 🔧 Tecnologías Utilizadas

- **Backend:** Node.js + Express + TypeScript
- **Base de Datos:** MySQL con mysql2
- **Autenticación:** JWT (jsonwebtoken)
- **Validación:** Joi
- **TTS:** Windows PowerShell Speech API
- **Seguridad:** bcrypt, CORS, helmet
- **Desarrollo:** nodemon, ES modules

## 📱 Roles del Sistema

| Rol | Permisos |
|-----|----------|
| **Administrador** | Acceso completo, gestión de usuarios y configuración |
| **Tutor** | Gestión de niños, creación de mensajes, asignación de contenido |
| **Niño** | Acceso a mensajes asignados, reproducción de audio, favoritos |

## 🎵 Sistema TTS Avanzado

- **Voz Inteligente:** Selección automática de voces femeninas en español
- **Velocidad Ajustable:** Control de velocidad (-10 a +10) para mejor comprensión
- **Calidad de Audio:** Generación de archivos WAV de alta calidad
- **Gestión de Archivos:** Limpieza automática y regeneración de audio

## 📚 Documentación Completa

Consulta `GUIA_COMPLETA_API.md` para:
- Documentación detallada de todos los endpoints
- Ejemplos de requests/responses para Postman
- Flujos de uso típicos
- Guía de troubleshooting
- Configuración avanzada

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo con hot reload
npm run build        # Compilar TypeScript a JavaScript  
npm start            # Ejecutar servidor de producción
npm run test         # Ejecutar tests (cuando estén configurados)
```

## 🌟 Casos de Uso

### Para Terapeutas/Tutores:
- Crear mensajes personalizados con audio automático
- Asignar contenido específico a cada niño
- Monitorear progreso y favoritos
- Gestionar relaciones tutor-niño

### Para Niños:
- Acceder a mensajes asignados por su tutor
- Reproducir audio con voz clara y comprensible
- Marcar mensajes favoritos
- Navegación por categorías (saludos, emociones, necesidades)

### Para Administradores:
- Gestión completa de usuarios y roles
- Configuración global del sistema TTS
- Monitoreo de relaciones y estadísticas
- Administración de categorías y contenido

## 🔒 Seguridad

- Autenticación JWT con expiración configurable
- Encriptación de contraseñas con bcrypt
- Validación exhaustiva de inputs con Joi
- Control de acceso basado en roles
- Protección CORS y headers de seguridad

## 📈 Estado del Proyecto

✅ **Completado:**
- Sistema de autenticación y autorización
- CRUD completo para todas las entidades
- Sistema TTS con voz de calidad
- Asignación y gestión de mensajes
- API REST con documentación completa

🔄 **En desarrollo:**
- Dashboard de estadísticas
- Sistema de notificaciones
- Exportación de reportes
- App móvil complementaria

## 🤝 Contribución

Este proyecto está diseñado para asistir en terapias del habla infantil. Las contribuciones son bienvenidas, especialmente en:
- Mejoras en el sistema TTS
- Optimizaciones de rendimiento
- Funcionalidades de accesibilidad
- Testing automatizado

## � Licencia

Proyecto de código abierto diseñado para fines educativos y terapéuticos.

---

**Nota:** Para guía completa de endpoints y ejemplos de uso en Postman, consultar `GUIA_COMPLETA_API.md`
   - Gestión de usuarios, roles y configuraciones
   - Visualización del dashboard completo
   - Moderación de contenido

2. **👨‍👩‍👧‍👦 Tutor**
   - Gestión de uno o varios niños vinculados
   - Creación y edición de mensajes y categorías
   - Programación de contenido personalizado
   - Monitoreo del progreso

3. **👶 Niño**
   - Acceso a mensajes asignados por su tutor
   - Reproducción de audio con un botón simple
   - Visualización de texto asociado
   - Personalización básica (favoritos)

### Módulos Principales

- **🔐 Autenticación y Autorización**: JWT + middleware de roles
- **👥 Gestión de Usuarios**: CRUD completo con validaciones
- **📁 Categorías**: Organización temática de mensajes
- **💬 Mensajes**: Texto + audio generado automáticamente
- **🔗 Relaciones**: Vinculación tutor-niño (muchos a muchos)
- **📊 Dashboard**: Estadísticas y métricas por rol

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- MySQL 8.0+
- NPM o Yarn
- Cuenta de Google Cloud (para TTS) o alternativa local

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd BackendWearext
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password
DB_NAME=wear1
DB_PORT=3306

# Servidor
PORT=3000

# JWT
JWT_SECRET=tu_secreto_superseguro_aqui

# TTS Configuration (Google Cloud)
GOOGLE_APPLICATION_CREDENTIALS=./path-to-service-account.json
TTS_LANGUAGE_CODE=es-ES
TTS_VOICE_NAME=es-ES-Wavenet-C

# Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# CORS
FRONTEND_URL=http://localhost:3001
MOBILE_APP_URL=*
```

### 4. Configurar base de datos

```bash
# Ejecutar script SQL
mysql -u root -p < db.sql
```

### 5. Ejecutar seeders (datos iniciales)

```bash
npm run seed
```

### 6. Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📡 Endpoints de la API

### 🔐 Autenticación
```
POST /auth/register    # Registro de usuario
POST /auth/login       # Inicio de sesión
POST /auth/logout      # Cerrar sesión
GET  /auth/profile     # Perfil del usuario autenticado
```

### 👥 Usuarios
```
GET    /users          # Listar usuarios (Admin)
GET    /users/:id      # Obtener usuario específico
PUT    /users/:id      # Actualizar usuario
DELETE /users/:id      # Eliminar usuario (Admin)
```

### 🏷️ Roles
```
GET    /roles          # Listar todos los roles
GET    /roles/:id      # Obtener rol específico
POST   /roles          # Crear rol (Admin)
PUT    /roles/:id      # Actualizar rol (Admin)
DELETE /roles/:id      # Eliminar rol (Admin)
```

### 📁 Categorías
```
GET    /categories           # Listar categorías
GET    /categories/:id       # Obtener categoría específica
POST   /categories          # Crear categoría (Tutor/Admin)
PUT    /categories/:id      # Actualizar categoría (Tutor/Admin)
DELETE /categories/:id      # Eliminar categoría (Admin)
```

### 💬 Mensajes
```
GET    /messages            # Listar mensajes según rol
GET    /messages/:id        # Obtener mensaje específico
POST   /messages           # Crear mensaje con TTS (Tutor/Admin)
PUT    /messages/:id       # Actualizar mensaje (Tutor/Admin)
DELETE /messages/:id       # Eliminar mensaje (Admin)
GET    /messages/:id/audio # Obtener archivo de audio
```

### 🔗 Relaciones Tutor-Niño
```
GET    /relations/my-children    # Niños del tutor autenticado
POST   /relations/link          # Vincular tutor con niño
DELETE /relations/unlink        # Desvincular relación
GET    /relations/my-tutors     # Tutores del niño autenticado
```

### 📊 Dashboard
```
GET /dashboard/stats     # Estadísticas generales según rol
GET /dashboard/messages  # Mensajes del usuario según rol
GET /dashboard/activity  # Actividad reciente
```

## 🛠️ Tecnologías Utilizadas

### Backend Core
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **MySQL2** - Cliente de base de datos

### Autenticación y Seguridad
- **jsonwebtoken** - Gestión de tokens JWT
- **bcrypt** - Hashing de contraseñas
- **cors** - Control de acceso entre orígenes

### Validación y Middleware
- **joi** - Validación de schemas
- **morgan** - Logging de requests
- **multer** - Manejo de archivos

### Text-to-Speech
- **@google-cloud/text-to-speech** - TTS de Google Cloud
- **node-gtts** - Alternativa TTS local (opcional)

### Desarrollo
- **nodemon** - Recarga automática en desarrollo
- **ts-node** - Ejecución directa de TypeScript

## 📱 Integración Móvil

### React Native
El backend está preparado para integrarse con aplicaciones React Native:

- **Endpoints RESTful** compatibles con fetch/axios
- **Autenticación JWT** para sesiones persistentes
- **CORS configurado** para requests cross-origin
- **Streaming de audio** para reproducción directa

### Smartwatch
Soporte especial para dispositivos wearables:

- **Autenticación persistente** para niños
- **Endpoints optimizados** para pantallas pequeñas
- **Respuestas ligeras** con datos mínimos necesarios
- **Audio en formatos** compatibles con wearables

## 🔧 Desarrollo

### Estructura de Carpetas

```
src/
├── config/         # Configuraciones (DB, TTS, uploads)
├── controllers/    # Lógica de controladores
├── middlewares/    # Middlewares personalizados
├── models/         # Interfaces TypeScript
├── routes/         # Definición de rutas
├── services/       # Lógica de negocio
├── seeders/        # Datos iniciales
└── utils/          # Utilidades y helpers
```

### Scripts Disponibles

```bash
npm run dev         # Desarrollo con recarga automática
npm run build       # Compilar TypeScript
npm start           # Ejecutar versión compilada
npm run seed        # Ejecutar seeders
npm run test        # Ejecutar tests (por implementar)
```

### Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

**Nota:** Para guía completa de endpoints y ejemplos de uso en Postman, consultar `GUIA_COMPLETA_API.md`
