import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sistema TTS para Terapia del Habla Infantil API',
            version: '1.0.0',
            description: `
        API completa para sistema de Text-to-Speech diseñado específicamente para asistir en la terapia del habla de niños con problemas de comunicación.
        
        ## Características Principales
        - 🎯 **Terapia del Habla Especializada**: Herramientas específicas para niños con dificultades de comunicación
        - 🔊 **TTS Inteligente**: Generación de audio con voces femeninas en español optimizadas para comprensión infantil
        - 👥 **Sistema de Roles**: Control granular de acceso (administrador, tutor, niño)
        - 🔗 **Gestión de Relaciones**: Vinculación tutor-niño para seguimiento personalizado
        - 📱 **API REST Completa**: Endpoints robustos con validación y autenticación JWT
        
        ## Flujo de Autenticación
        1. Registrarse o iniciar sesión para obtener token JWT
        2. Incluir el token en el header Authorization: Bearer <token>
        3. Acceder a endpoints según el rol del usuario
        
        ## Roles del Sistema
        - **Administrador (ID: 1)**: Acceso completo al sistema
        - **Tutor (ID: 2)**: Gestión de niños y creación de contenido
        - **Niño (ID: 3)**: Acceso a mensajes asignados y reproducción de audio
      `,
            contact: {
                name: 'Soporte Técnico',
                email: 'soporte@wearext.com'
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de Desarrollo'
            },
            {
                url: 'https://api.wearext.com',
                description: 'Servidor de Producción'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtenido del endpoint de login. Formato: Bearer <token>'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID único del usuario',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre completo del usuario',
                            example: 'Juan Pérez'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Correo electrónico único',
                            example: 'juan@example.com'
                        },
                        role_id: {
                            type: 'integer',
                            description: 'ID del rol (1=administrador, 2=tutor, 3=niño)',
                            example: 2
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación',
                            example: '2024-01-15T10:30:00.000Z'
                        }
                    }
                },
                Message: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID único del mensaje',
                            example: 1
                        },
                        text: {
                            type: 'string',
                            description: 'Texto del mensaje que se convertirá a audio',
                            example: 'Hola, ¿cómo estás?'
                        },
                        audio_url: {
                            type: 'string',
                            description: 'URL del archivo de audio generado por TTS',
                            example: 'audio/mensaje_1_1642248600000.wav'
                        },
                        category_id: {
                            type: 'integer',
                            description: 'ID de la categoría del mensaje',
                            example: 1
                        },
                        category_name: {
                            type: 'string',
                            description: 'Nombre de la categoría',
                            example: 'Saludos'
                        },
                        created_by: {
                            type: 'integer',
                            description: 'ID del usuario que creó el mensaje',
                            example: 1
                        },
                        creator_name: {
                            type: 'string',
                            description: 'Nombre del creador del mensaje',
                            example: 'Juan Pérez'
                        },
                        is_active: {
                            type: 'boolean',
                            description: 'Estado activo del mensaje',
                            example: true
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00.000Z'
                        }
                    }
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre de la categoría',
                            example: 'Saludos'
                        },
                        description: {
                            type: 'string',
                            description: 'Descripción de la categoría',
                            example: 'Mensajes de saludo y despedida'
                        },
                        color: {
                            type: 'string',
                            description: 'Color hexadecimal para la UI',
                            example: '#4CAF50'
                        },
                        icon: {
                            type: 'string',
                            description: 'Nombre del icono',
                            example: 'waving-hand'
                        },
                        is_active: {
                            type: 'boolean',
                            example: true
                        }
                    }
                },
                Role: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre del rol',
                            example: 'administrador'
                        },
                        description: {
                            type: 'string',
                            description: 'Descripción del rol y sus permisos',
                            example: 'Acceso completo al sistema, gestión de usuarios y configuración'
                        }
                    }
                },
                Relation: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        tutor: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', example: 2 },
                                name: { type: 'string', example: 'Juan Pérez' },
                                email: { type: 'string', example: 'juan@example.com' }
                            }
                        },
                        child: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', example: 3 },
                                name: { type: 'string', example: 'María García' },
                                email: { type: 'string', example: 'maria@example.com' }
                            }
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00.000Z'
                        }
                    }
                },
                ChildMessage: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1
                        },
                        message: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', example: 1 },
                                text: { type: 'string', example: 'Hola, ¿cómo estás?' },
                                audio_url: { type: 'string', example: 'audio/mensaje_1_1642248600000.wav' },
                                category: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'integer', example: 1 },
                                        name: { type: 'string', example: 'Saludos' },
                                        color: { type: 'string', example: '#4CAF50' },
                                        icon: { type: 'string', example: 'waving-hand' }
                                    }
                                }
                            }
                        },
                        is_favorite: {
                            type: 'boolean',
                            description: 'Si el niño marcó este mensaje como favorito',
                            example: false
                        },
                        assigned_at: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00.000Z'
                        },
                        assigned_by: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', example: 2 },
                                name: { type: 'string', example: 'Juan Pérez' }
                            }
                        }
                    }
                },
                TTSSettings: {
                    type: 'object',
                    properties: {
                        preferredGender: {
                            type: 'string',
                            enum: ['female', 'male'],
                            description: 'Género preferido para la voz TTS',
                            example: 'female'
                        },
                        preferredLanguage: {
                            type: 'string',
                            description: 'Idioma preferido (es para español)',
                            example: 'es'
                        },
                        speed: {
                            type: 'integer',
                            minimum: -10,
                            maximum: 10,
                            description: 'Velocidad de habla (-10 muy lento, 10 muy rápido)',
                            example: -2
                        },
                        volume: {
                            type: 'integer',
                            minimum: 0,
                            maximum: 100,
                            description: 'Volumen de la voz (0-100)',
                            example: 80
                        }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Indica si la operación fue exitosa',
                            example: true
                        },
                        message: {
                            type: 'string',
                            description: 'Mensaje descriptivo de la operación',
                            example: 'Operación completada exitosamente'
                        },
                        data: {
                            type: 'object',
                            description: 'Datos de respuesta específicos del endpoint'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            description: 'Mensaje de error',
                            example: 'Error en la validación de datos'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Lista detallada de errores',
                            example: ['El campo email es requerido', 'La contraseña debe tener al menos 6 caracteres']
                        }
                    }
                },
                WebSocketStatus: {
                    type: 'object',
                    properties: {
                        esp32Connected: {
                            type: 'boolean',
                            description: 'Estado de conexión del ESP32',
                            example: true
                        },
                        mobileClientsCount: {
                            type: 'integer',
                            description: 'Número de clientes móviles conectados',
                            example: 2
                        },
                        esp32Status: {
                            type: 'object',
                            properties: {
                                connected: {
                                    type: 'boolean',
                                    example: true
                                },
                                battery: {
                                    type: 'integer',
                                    description: 'Nivel de batería (%)',
                                    example: 85
                                },
                                category: {
                                    type: 'integer',
                                    description: 'Categoría actual',
                                    example: 1
                                },
                                lastHeartbeat: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2024-01-15T10:30:00.000Z'
                                }
                            }
                        }
                    }
                },
                WebSocketCommand: {
                    type: 'object',
                    properties: {
                        command: {
                            type: 'string',
                            enum: ['play', 'category', 'battery', 'shutdown'],
                            description: 'Comando a enviar al ESP32',
                            example: 'play'
                        },
                        button: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 3,
                            description: 'Botón para comando play',
                            example: 1
                        },
                        category: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 3,
                            description: 'Categoría para comando category',
                            example: 2
                        },
                        data: {
                            type: 'object',
                            description: 'Datos adicionales del comando'
                        }
                    },
                    required: ['command']
                }
            }
        },
        tags: [
            {
                name: 'Autenticación',
                description: 'Endpoints para registro, login y gestión de sesiones'
            },
            {
                name: 'Usuarios',
                description: 'Gestión de usuarios del sistema (CRUD completo)'
            },
            {
                name: 'Mensajes',
                description: 'Gestión de mensajes con generación automática de audio TTS'
            },
            {
                name: 'Relaciones',
                description: 'Gestión de relaciones tutor-niño para seguimiento personalizado'
            },
            {
                name: 'Asignación de Mensajes',
                description: 'Asignación específica de mensajes a niños y gestión de favoritos'
            },
            {
                name: 'Configuración TTS',
                description: 'Configuración avanzada del sistema de Text-to-Speech'
            },
            {
                name: 'Categorías',
                description: 'Gestión de categorías para organizar mensajes temáticamente'
            },
            {
                name: 'Roles',
                description: 'Gestión de roles y permisos del sistema'
            },
            {
                name: 'Seeder',
                description: 'Herramientas de inicialización de datos para desarrollo (solo desarrollo)'
            },
            {
                name: 'WebSocket',
                description: 'Gestión de comunicación en tiempo real con ESP32 y aplicaciones móviles'
            },
            {
                name: 'ESP32 Control',
                description: 'Control directo del dispositivo ESP32 TalkingChildren en tiempo real'
            }
        ]
    },
    apis: ['./src/routes/*.ts'], // Archivos que contienen anotaciones de Swagger
};

export const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2196F3; }
      .swagger-ui .scheme-container { background: #fafafa; padding: 15px; border-radius: 4px; }
    `,
        customSiteTitle: 'API - Sistema TTS Infantil',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            showExtensions: true,
            showCommonExtensions: true
        }
    }));

    console.log('📚 Swagger documentation available at: http://localhost:3000/api-docs');
};
