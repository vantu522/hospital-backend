import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Management API',
      version: '1.0.0',
      description: 'API documentation for Hospital Management System',
      contact: {
        name: 'Hospital Dev Team',
        email: 'admin@hospital.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password'
            },
            role: {
              type: 'string',
              enum: ['admin', 'doctor', 'user'],
              default: 'user',
              description: 'User role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Doctor: {
          type: 'object',
          required: ['full_name', 'specialties'],
          properties: {
            _id: {
              type: 'string',
              description: 'Doctor ID'
            },
            full_name: {
              type: 'string',
              description: 'Doctor full name'
            },
            specialties: {
              type: 'string',
              description: 'Doctor specialties'
            },
            hospital: {
              type: 'string',
              description: 'Hospital name'
            },
            department: {
              type: 'string',
              description: 'Department'
            },
            degree: {
              type: 'string',
              description: 'Medical degree'
            },
            description: {
              type: 'string',
              description: 'Doctor description'
            },
            experience: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Work experience'
            },
            certifications: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Certifications'
            },
            expertise_fields: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Expertise fields'
            },
            training_process: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Training process'
            },
            slug: {
              type: 'string',
              description: 'URL slug'
            },
            avatar: {
              type: 'string',
              description: 'Avatar URL'
            },
            phone_number: {
              type: 'string',
              description: 'Phone number'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            work_address: {
              type: 'string',
              description: 'Work address'
            },
            is_active: {
              type: 'boolean',
              default: true,
              description: 'Active status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        News: {
          type: 'object',
          required: ['title', 'slug'],
          properties: {
            _id: {
              type: 'string',
              description: 'News ID'
            },
            title: {
              type: 'string',
              description: 'News title'
            },
            slug: {
              type: 'string',
              description: 'URL slug'
            },
            description: {
              type: 'string',
              description: 'Short description'
            },
            content: {
              type: 'string',
              description: 'News content'
            },
            image: {
              type: 'string',
              description: 'Featured image URL'
            },
            author: {
              type: 'string',
              description: 'Author name'
            },
            category: {
              type: 'string',
              description: 'News category'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'News tags'
            },
            publish_date: {
              type: 'string',
              format: 'date-time',
              description: 'Publish date'
            },
            is_active: {
              type: 'boolean',
              default: true,
              description: 'Active status'
            },
            view_count: {
              type: 'number',
              default: 0,
              description: 'View count'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Service: {
          type: 'object',
          required: ['name', 'specialties', 'slug'],
          properties: {
            _id: {
              type: 'string',
              description: 'Service ID'
            },
            name: {
              type: 'string',
              description: 'Service name'
            },
            specialties: {
              type: 'string',
              description: 'Related specialties'
            },
            description: {
              type: 'string',
              description: 'Service description'
            },
            slug: {
              type: 'string',
              description: 'URL slug'
            },
            avatar: {
              type: 'string',
              description: 'Service avatar'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Service images'
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Service features'
            },
            is_active: {
              type: 'boolean',
              default: true,
              description: 'Active status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Specialty: {
          type: 'object',
          required: ['name'],
          properties: {
            _id: {
              type: 'string',
              description: 'Specialty ID'
            },
            name: {
              type: 'string',
              description: 'Specialty name'
            },
            description: {
              type: 'string',
              description: 'Specialty description'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Specialty images'
            },
            functions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Specialty functions'
            },
            slug: {
              type: 'string',
              description: 'URL slug'
            },
            is_active: {
              type: 'boolean',
              default: true,
              description: 'Active status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'string',
              description: 'Error details'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'User ID'
                },
                name: {
                  type: 'string',
                  description: 'User name'
                },
                email: {
                  type: 'string',
                  description: 'User email'
                },
                role: {
                  type: 'string',
                  description: 'User role'
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/app/controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
