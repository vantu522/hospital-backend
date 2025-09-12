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
        ClinicRoom: {
          type: 'object',
          required: ['name', 'rooms'],
          properties: {
            _id: { type: 'string', description: 'ClinicRoom ID' },
            name: { type: 'string', description: 'Tên chuyên khoa/phòng khám' },
            rooms: {
              type: 'array',
              items: { type: 'string' },
              description: 'Danh sách các phòng thuộc chuyên khoa/phòng khám'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        LoaiKham: {
          type: 'object',
          required: ['_id', 'ma', 'ten'],
          properties: {
            _id: { type: 'string', description: 'Mã loại khám' },
            ma: { type: 'string', description: 'Mã loại khám (uppercase)' },
            ten: { type: 'string', description: 'Tên loại khám' },
            is_active: { type: 'boolean', default: true, description: 'Trạng thái hoạt động' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        KhoaKham: {
          type: 'object',
          required: ['_id', 'ma', 'ten', 'dia_chi', 'cap_quan_li'],
          properties: {
            _id: { type: 'string', description: 'Mã khoa khám' },
            ma: { type: 'string', description: 'Mã khoa khám (uppercase)' },
            ten: { type: 'string', description: 'Tên khoa khám' },
            dia_chi: { type: 'string', description: 'Địa chỉ khoa khám' },
            cap_quan_li: { type: 'string', description: 'Cấp quản lí khoa khám' },
            is_active: { type: 'boolean', default: true, description: 'Trạng thái hoạt động' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        PhongKham: {
          type: 'object',
          required: ['_id', 'ma', 'ten', 'dia_chi'],
          properties: {
            _id: { type: 'string', description: 'Mã phòng khám' },
            ma: { type: 'string', description: 'Mã phòng khám (uppercase)' },
            ten: { type: 'string', description: 'Tên phòng khám' },
            dia_chi: { type: 'string', description: 'Địa chỉ phòng khám' },
            cap_quan_li: { type: 'string', default: 'Phòng', description: 'Cấp quản lí phòng khám' },
            is_active: { type: 'boolean', default: true, description: 'Trạng thái hoạt động' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CongKham: {
          type: 'object',
          required: ['_id', 'ma_bv', 'ma_bhyt', 'ten_bv', 'ten_bhyt'],
          properties: {
            _id: { type: 'string', description: 'Mã cổng khám' },
            ma_bv: { type: 'string', description: 'Mã bệnh viện' },
            ma_bhyt: { type: 'string', description: 'Mã BHYT' },
            ten_bv: { type: 'string', description: 'Tên bệnh viện' },
            ten_bhyt: { type: 'string', description: 'Tên BHYT' },
            is_active: { type: 'boolean', default: true, description: 'Trạng thái hoạt động' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        HealthInsuranceExam: {
          type: 'object',
          required: [
            'full_name', 'citizen_id', 'date_of_birth', 'gender', 'address', 'clinicRoom', 'exam_type', 'slotId', 'exam_date', 'exam_time'
          ],
          properties: {
            _id: { type: 'string', description: 'Exam ID' },
            full_name: { type: 'string', description: 'Họ tên bệnh nhân' },
            phone_number: { type: 'string', description: 'Số điện thoại' },
            email: { type: 'string', description: 'Email' },
            citizen_id: { type: 'string', description: 'Số CCCD' },
            date_of_birth: { type: 'string', format: 'date', description: 'Ngày sinh' },
            gender: { type: 'string', enum: ['Nam', 'Nữ', 'Khác'], description: 'Giới tính' },
            address: { type: 'string', description: 'Địa chỉ' },
            health_insurance_number: { type: 'string', description: 'Số thẻ BHYT' },
            clinicRoom: { type: 'string', description: 'ID phòng khám (ClinicRoom)' },
            exam_type: { type: 'string', enum: ['BHYT', 'DV'], description: 'Loại hình khám' },
            slotId: { type: 'string', description: 'ID slot khám' },
            exam_date: { type: 'string', format: 'date', description: 'Ngày khám' },
            exam_time: { type: 'string', description: 'Giờ khám' },
            symptoms: { type: 'string', description: 'Triệu chứng' },
            status: { type: 'string', enum: ['pending', 'accept', 'reject'], description: 'Trạng thái' },
            is_priority: { type: 'boolean', description: 'Ưu tiên' },
            order_number: { type: 'number', description: 'Số thứ tự khám' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
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
        Recruitment: {
          type: 'object',
          required: ['title', 'specialty_id', 'recruitment_count', 'expiry_date'],
          properties: {
            _id: {
              type: 'string',
              description: 'Recruitment ID'
            },
            title: {
              type: 'string',
              description: 'Recruitment title'
            },
            slug: {
              type: 'string',
              description: 'URL slug'
            },
            position: {
              type: 'string',
              description: 'Position name'
            },
            specialty_id: {
              type: 'string',
              description: 'Specialty ID reference'
            },
            description: {
              type: 'string',
              description: 'Job description'
            },
            requirements: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Job requirements'
            },
            benefits: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Job benefits'
            },
            deadline: {
              type: 'string',
              format: 'date',
              description: 'Application deadline'
            },
            location: {
              type: 'string',
              description: 'Work location'
            },
            contact_email: {
              type: 'string',
              format: 'email',
              description: 'Contact email'
            },
            recruitment_count: {
              type: 'number',
              minimum: 1,
              description: 'Number of positions to recruit'
            },
            expiry_date: {
              type: 'string',
              format: 'date-time',
              description: 'Recruitment post expiry date'
            },
            document: {
              type: 'string',
              description: 'Document file path'
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
        HealthConsultation: {
          type: 'object',
          required: ['title', 'slug', 'image', 'description', 'specialty_id'],
          properties: {
            _id: {
              type: 'string',
              description: 'Health consultation ID'
            },
            title: {
              type: 'string',
              description: 'Health consultation title'
            },
            slug: {
              type: 'string',
              description: 'URL slug'
            },
            image: {
              type: 'string',
              description: 'Consultation image URL'
            },
            description: {
              type: 'string',
              description: 'Health consultation description'
            },
            specialty_id: {
              type: 'string',
              description: 'Specialty ID reference'
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
        Application: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            _id: {
              type: 'string',
              description: 'Application ID'
            },
            name: {
              type: 'string',
              description: 'Applicant full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Applicant email address'
            },
            phone: {
              type: 'string',
              description: 'Applicant phone number'
            },
            coverLetter: {
              type: 'string',
              description: 'Cover letter content'
            },
            cvFileUrl: {
              type: 'string',
              description: 'CV file path/URL'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              default: 'pending',
              description: 'Application status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Application submission date'
            }
          }
        },
        BackgroundBanner: {
          type: 'object',
          required: ['image', 'description'],
          properties: {
            _id: {
              type: 'string',
              description: 'Background banner ID'
            },
            image: {
              type: 'string',
              description: 'Banner image URL from Cloudinary'
            },
            description: {
              type: 'string',
              description: 'Banner description'
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
