# Guía Completa API - Sistema TTS para Terapia del Habla Infantil

## Descripción del Proyecto

### 🎯 Propósito y Contexto

Este sistema backend ha sido desarrollado específicamente para **transformar la terapia del habla infantil** mediante tecnología de vanguardia. Diseñado para niños con dificultades en la comunicación verbal, el sistema proporciona una solución integral que combina:

- **Tecnología TTS avanzada** para generar audio de alta calidad con voces naturales
- **Gestión personalizada de contenido** adaptado a las necesidades específicas de cada niño
- **Sistema de roles especializado** que facilita la colaboración entre terapeutas, tutores y niños
- **Arquitectura escalable** preparada para integración con dispositivos wearables y aplicaciones móviles

### 🏥 Casos de Uso Clínicos

**Para Terapeutas del Habla:**
- Crear bibliotecas de mensajes terapéuticos personalizados
- Asignar ejercicios específicos de comunicación a cada paciente
- Monitorear el progreso mediante el sistema de favoritos
- Generar contenido audio inmediato sin necesidad de grabaciones manuales

**Para Tutores/Padres:**
- Acceder a herramientas de apoyo para continuar la terapia en casa
- Gestionar múltiples niños con contenido específico para cada uno
- Crear rutinas de comunicación diaria con mensajes pregrabados
- Facilitar la comunicación básica cuando el niño tiene dificultades verbales

**Para Niños:**
- Acceder a mensajes de comunicación esencial de forma independiente
- Practicar con audio claro y comprensible generado específicamente para ellos
- Desarrollar confianza mediante el uso de tecnología adaptada a sus necesidades
- Comunicar necesidades básicas cuando la expresión verbal es limitada

### 🔧 Arquitectura Técnica

**Backend Robusto:**
- **Node.js + TypeScript** para desarrollo moderno y tipado fuerte
- **MySQL** como base de datos relacional para integridad de datos críticos
- **JWT Authentication** con control granular de permisos por rol
- **Middleware de validación** con Joi para garantizar calidad de datos

**Sistema TTS Inteligente:**
- **Windows PowerShell Speech API** para generación de audio nativo
- **Selección automática de voces** priorizando español femenino para mejor comprensión infantil
- **Control de velocidad ajustable** (-10 a +10) para adaptarse al nivel de comprensión
- **Gestión de archivos WAV** con limpieza automática y regeneración eficiente

**Características Distintivas:**
- **Autenticación JWT** con roles específicos (administrador, tutor, niño)
- **Generación de audio TTS** con voz femenina en español usando Windows PowerShell
- **Gestión de mensajes** con asignación personalizada a niños
- **Sistema de relaciones** tutor-niño para seguimiento personalizado
- **API REST completa** con validación robusta y manejo de errores
- **Sistema de favoritos** para personalización del contenido
- **Categorización inteligente** (saludos, emociones, necesidades, actividades)

---

## Configuración Inicial

### Requisitos Previos
- Node.js (v18+)
- MySQL Server
- Windows (para funcionalidad TTS nativa)

### Instalación
```bash
npm install
```

### Base de Datos
Ejecutar el script `db.sql` en MySQL para crear las tablas necesarias.

### Variables de Entorno
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=wearext_db
JWT_SECRET=tu_jwt_secret_muy_seguro
PORT=3000
```

### Iniciar Servidor
```bash
npm run dev
```

---

## Estructura de Roles

| Role ID | Nombre | Descripción |
|---------|--------|-------------|
| 1 | administrador | Acceso completo al sistema |
| 2 | tutor | Gestión de niños y mensajes |
| 3 | niño | Acceso a mensajes asignados |

---

## Guía de Endpoints para Postman

### 🔐 AUTENTICACIÓN

#### **POST** `/api/auth/register`
**Descripción:** Registrar nuevo usuario

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role_id": 2
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role_id": 2
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### **POST** `/api/auth/login`
**Descripción:** Iniciar sesión

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role_id": 2
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 👥 GESTIÓN DE USUARIOS

#### **GET** `/api/users`
**Descripción:** Obtener todos los usuarios

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role_id": 2,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### **POST** `/api/users`
**Descripción:** Crear nuevo usuario

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "name": "María García",
  "email": "maria@example.com",
  "password": "password123",
  "role_id": 3
}
```

---

#### **PUT** `/api/users/:id`
**Descripción:** Actualizar usuario

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "name": "María García López",
  "email": "maria.garcia@example.com"
}
```

---

#### **DELETE** `/api/users/:id`
**Descripción:** Eliminar usuario

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 💬 GESTIÓN DE MENSAJES

#### **GET** `/api/messages`
**Descripción:** Obtener mensajes (filtrado por rol)

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "text": "Hola, ¿cómo estás?",
      "audio_url": "audio/mensaje_1_1642248600000.wav",
      "category_id": 1,
      "category_name": "Saludos",
      "created_by": 1,
      "creator_name": "Juan Pérez",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### **POST** `/api/messages`
**Descripción:** Crear nuevo mensaje con audio TTS

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "text": "Buenos días. ¿Cómo te sientes hoy?",
  "category_id": 1
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Mensaje creado exitosamente",
  "data": {
    "id": 2,
    "text": "Buenos días. ¿Cómo te sientes hoy?",
    "audio_url": "audio/mensaje_2_1642248700000.wav",
    "category_id": 1,
    "category_name": "Saludos",
    "created_by": 1,
    "creator_name": "Juan Pérez",
    "is_active": true,
    "created_at": "2024-01-15T11:45:00.000Z"
  }
}
```

---

#### **GET** `/api/messages/:id/audio`
**Descripción:** Obtener archivo de audio del mensaje

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta:** Archivo WAV con audio generado por TTS

---

#### **PUT** `/api/messages/:id`
**Descripción:** Actualizar mensaje (regenera audio si cambia el texto)

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "text": "Buenos días. Espero que tengas un día maravilloso",
  "category_id": 1,
  "is_active": true
}
```

---

#### **POST** `/api/messages/:id/regenerate-audio`
**Descripción:** Regenerar audio de un mensaje

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### **DELETE** `/api/messages/:id`
**Descripción:** Eliminar mensaje

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 🔗 GESTIÓN DE RELACIONES TUTOR-NIÑO

#### **GET** `/api/relations/my-children`
**Descripción:** Obtener niños asignados al tutor (solo tutores)

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tutor": {
        "id": 2,
        "name": "Juan Pérez",
        "email": "juan@example.com"
      },
      "child": {
        "id": 3,
        "name": "María García",
        "email": "maria@example.com"
      },
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### **POST** `/api/relations`
**Descripción:** Crear relación tutor-niño

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "tutor_id": 2,
  "child_id": 3
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Relación creada exitosamente",
  "data": {
    "id": 1,
    "tutor": {
      "id": 2,
      "name": "Juan Pérez",
      "email": "juan@example.com"
    },
    "child": {
      "id": 3,
      "name": "María García",
      "email": "maria@example.com"
    },
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### **DELETE** `/api/relations/:id`
**Descripción:** Eliminar relación por ID

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 📝 ASIGNACIÓN DE MENSAJES A NIÑOS

#### **POST** `/api/child-messages/assign`
**Descripción:** Asignar mensaje a un niño específico

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "child_id": 3,
  "message_id": 1
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Mensaje asignado exitosamente",
  "data": {
    "id": 1,
    "message": {
      "id": 1,
      "text": "Hola, ¿cómo estás?",
      "audio_url": "audio/mensaje_1_1642248600000.wav",
      "category": {
        "id": 1,
        "name": "Saludos",
        "color": "#4CAF50",
        "icon": "waving-hand"
      }
    },
    "is_favorite": false,
    "assigned_at": "2024-01-15T10:30:00.000Z",
    "assigned_by": {
      "id": 2,
      "name": "Juan Pérez"
    }
  }
}
```

---

#### **GET** `/api/child-messages/my-messages`
**Descripción:** Obtener mensajes asignados al niño (solo niños)

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "message": {
        "id": 1,
        "text": "Hola, ¿cómo estás?",
        "audio_url": "audio/mensaje_1_1642248600000.wav",
        "category": {
          "id": 1,
          "name": "Saludos",
          "color": "#4CAF50",
          "icon": "waving-hand"
        }
      },
      "is_favorite": false,
      "assigned_at": "2024-01-15T10:30:00.000Z",
      "assigned_by": {
        "id": 2,
        "name": "Juan Pérez"
      }
    }
  ]
}
```

---

#### **GET** `/api/child-messages/favorites`
**Descripción:** Obtener mensajes favoritos del niño (solo niños)

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### **PUT** `/api/child-messages/:id`
**Descripción:** Actualizar asignación (marcar/desmarcar como favorito)

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "is_favorite": true
}
```

---

#### **GET** `/api/child-messages/child/:childId`
**Descripción:** Obtener mensajes de un niño específico (tutores/admin)

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### **DELETE** `/api/child-messages/child/:childId/message/:messageId`
**Descripción:** Remover asignación de mensaje a niño

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 🔊 CONFIGURACIÓN DE VOZ TTS

#### **GET** `/api/tts/voices`
**Descripción:** Obtener voces disponibles en el sistema

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "availableVoices": [
      "Microsoft Sabina Desktop - Spanish (Mexico)",
      "Microsoft Helena Desktop - Spanish (Spain)",
      "Microsoft David Desktop - English (United States)"
    ],
    "currentSettings": {
      "preferredGender": "female",
      "preferredLanguage": "es",
      "speed": -2,
      "volume": 80
    }
  }
}
```

---

#### **PUT** `/api/tts/settings`
**Descripción:** Actualizar configuración de voz

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "preferredGender": "female",
  "preferredLanguage": "es",
  "speed": -3,
  "volume": 85
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Configuración de voz actualizada",
  "data": {
    "preferredGender": "female",
    "preferredLanguage": "es",
    "speed": -3,
    "volume": 85
  }
}
```

---

#### **POST** `/api/tts/test`
**Descripción:** Generar audio de prueba

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "text": "Esta es una prueba de la nueva configuración de voz"
}
```

**Respuesta:** Archivo WAV de prueba

---

### 🏷️ GESTIÓN DE CATEGORÍAS

#### **GET** `/api/categories`
**Descripción:** Obtener todas las categorías

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Saludos",
      "description": "Mensajes de saludo y despedida",
      "color": "#4CAF50",
      "icon": "waving-hand",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

#### **POST** `/api/categories`
**Descripción:** Crear nueva categoría

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "name": "Actividades",
  "description": "Mensajes sobre actividades diarias",
  "color": "#FF5722",
  "icon": "activity"
}
```

---

### 🛡️ GESTIÓN DE ROLES

#### **GET** `/api/roles`
**Descripción:** Obtener todos los roles

**Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "administrador",
      "description": "Acceso completo al sistema, gestión de usuarios y configuración"
    },
    {
      "id": 2,
      "name": "tutor",
      "description": "Puede gestionar niños, crear mensajes y categorías"
    },
    {
      "id": 3,
      "name": "niño",
      "description": "Puede escuchar mensajes asignados y reproducir audios"
    }
  ]
}
```

---

## Flujo de Uso Típico

### 1. **Registro y Autenticación**
```
POST /api/auth/register → Crear usuarios (admin, tutores, niños)
POST /api/auth/login → Obtener token JWT
```

### 2. **Configuración Inicial (Admin)**
```
POST /api/categories → Crear categorías de mensajes
PUT /api/tts/settings → Configurar voz preferida
```

### 3. **Gestión de Relaciones (Tutor)**
```
POST /api/relations → Vincular tutor con niños
GET /api/relations/my-children → Ver niños asignados
```

### 4. **Creación de Contenido (Tutor)**
```
POST /api/messages → Crear mensajes con TTS automático
POST /api/child-messages/assign → Asignar mensajes a niños específicos
```

### 5. **Uso por Niños**
```
GET /api/child-messages/my-messages → Ver mensajes asignados
GET /api/messages/:id/audio → Reproducir audio
PUT /api/child-messages/:id → Marcar favoritos
```

---

## Códigos de Respuesta HTTP

| Código | Significado |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Error en la solicitud (validación) |
| 401 | No autorizado (token inválido) |
| 403 | Prohibido (sin permisos de rol) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## Notas Importantes

### Autenticación
- Todos los endpoints (excepto `/auth/register` y `/auth/login`) requieren el header `Authorization: Bearer <token>`
- Los tokens JWT incluyen información del usuario y rol para control de acceso

### Control de Acceso por Roles
- **Administradores:** Acceso completo a todas las funcionalidades
- **Tutores:** Pueden gestionar sus niños, crear/editar mensajes, asignar contenido
- **Niños:** Solo pueden acceder a sus mensajes asignados y marcar favoritos

### Sistema TTS
- Generación automática de audio al crear/actualizar mensajes
- Configuración inteligente de voz (preferencia por voces femeninas en español)
- Velocidad ajustable (-10 a +10) para facilitar comprensión
- Archivos de audio almacenados en directorio `audio/`

### Base de Datos
- Todas las operaciones incluyen validaciones de integridad referencial
- Eliminación en cascada para mantener consistencia
- Timestamps automáticos en todas las tablas

---

## Troubleshooting

### Error: "No se puede generar audio"
- Verificar que Windows tiene voces TTS instaladas
- Comprobar permisos de escritura en directorio `audio/`

### Error: "Token inválido"
- Verificar que el token no haya expirado
- Asegurar formato correcto: `Bearer <token>`

### Error: "Sin permisos para esta operación"
- Verificar que el usuario tiene el rol adecuado
- Revisar que la relación tutor-niño existe para operaciones específicas

---

*Esta guía cubre todas las funcionalidades del sistema TTS. Para soporte técnico adicional, revisar logs del servidor y base de datos.*
