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
      },
      {
        url: 'http://14.224.198.248:5000',
        description: 'Production/Test server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token in format: your-jwt-token-here'
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

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and management
 *   - name: Health Insurance Exams
 *     description: Health insurance exam booking and management
 *   - name: Customers
 *     description: Customer registration and login
 *   - name: Time Slot Templates
 *     description: Time slot template management
 *   - name: Schedule Slots
 *     description: Schedule slot management
 *   - name: Import
 *     description: Data import functionality
 *   - name: Khoa Kham
 *     description: Department management
 *   - name: Phong Kham
 *     description: Clinic room management
 *   - name: Loai Kham
 *     description: Exam type management
 *   - name: Cong Kham
 *     description: Exam gate management
 *   - name: Clinic Rooms
 *     description: Clinic room specialties management
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create new user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['name', 'email', 'password', 'role']
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ['admin', 'doctor', 'user']
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/customers/register:
 *   post:
 *     summary: Customer registration
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['HoTen', 'DienThoai', 'MatKhau']
 *             properties:
 *               HoTen:
 *                 type: string
 *                 description: Full name
 *               DienThoai:
 *                 type: string
 *                 description: Phone number
 *               MatKhau:
 *                 type: string
 *                 description: Password
 *               Email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               CCCD:
 *                 type: string
 *                 description: Citizen ID
 *               NgaySinh:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *               GioiTinh:
 *                 type: string
 *                 enum: ['Nam', 'Nữ']
 *                 description: Gender
 *               DiaChi:
 *                 type: string
 *                 description: Address
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/customers/login:
 *   post:
 *     summary: Customer login
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['DienThoai', 'MatKhau']
 *             properties:
 *               DienThoai:
 *                 type: string
 *                 description: Phone number
 *               MatKhau:
 *                 type: string
 *                 description: Password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 customer:
 *                   type: object
 *                   description: Customer information
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/customers/receptionist:
 *   post:
 *     summary: Create receptionist account
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['HoTen', 'DienThoai', 'MatKhau']
 *             properties:
 *               HoTen:
 *                 type: string
 *                 description: Full name
 *               DienThoai:
 *                 type: string
 *                 description: Phone number
 *               MatKhau:
 *                 type: string
 *                 description: Password
 *               Email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *     responses:
 *       201:
 *         description: Receptionist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/health-insurance-exams/all:
 *   get:
 *     summary: Get all health insurance exams with pagination
 *     tags: [Health Insurance Exams]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['pending', 'accept', 'reject']
 *         description: Filter by status
 *       - in: query
 *         name: exam_type
 *         schema:
 *           type: string
 *           enum: ['BHYT', 'DV']
 *         description: Filter by exam type
 *       - in: query
 *         name: exam_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by exam date
 *     responses:
 *       200:
 *         description: List of health insurance exams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HealthInsuranceExam'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */

/**
 * @swagger
 * /api/health-insurance-exams/book:
 *   post:
 *     summary: Book health insurance exam
 *     tags: [Health Insurance Exams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthInsuranceExam'
 *     responses:
 *       201:
 *         description: Exam booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exam:
 *                   $ref: '#/components/schemas/HealthInsuranceExam'
 *                 qr_code:
 *                   type: string
 *                   description: QR code image base64
 *                 encoded_id:
 *                   type: string
 *                   description: Encoded exam ID
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/health-insurance-exams/check/{encoded_id}:
 *   get:
 *     summary: Check exam validity by QR code
 *     tags: [Health Insurance Exams]
 *     parameters:
 *       - in: path
 *         name: encoded_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Encoded exam ID from QR code
 *     responses:
 *       200:
 *         description: Exam check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/HealthInsuranceExam'
 *       400:
 *         description: Invalid QR code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/health-insurance-exams/check-bhyt-date:
 *   post:
 *     summary: Check BHYT card validity
 *     tags: [Health Insurance Exams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['maThe', 'hoTen', 'ngaySinh']
 *             properties:
 *               maThe:
 *                 type: string
 *                 description: BHYT card number
 *               hoTen:
 *                 type: string
 *                 description: Full name
 *               ngaySinh:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *     responses:
 *       200:
 *         description: BHYT card check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid BHYT card
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/health-insurance-exams/by-cccd/{cccd}:
 *   get:
 *     summary: Get exam by CCCD
 *     tags: [Health Insurance Exams]
 *     parameters:
 *       - in: path
 *         name: cccd
 *         required: true
 *         schema:
 *           type: string
 *         description: Citizen ID number
 *     responses:
 *       200:
 *         description: Exam found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthInsuranceExam'
 *       404:
 *         description: Exam not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/health-insurance-exams/{id}:
 *   get:
 *     summary: Get exam by ID
 *     tags: [Health Insurance Exams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthInsuranceExam'
 *       404:
 *         description: Exam not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update exam by ID
 *     tags: [Health Insurance Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthInsuranceExam'
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthInsuranceExam'
 *       404:
 *         description: Exam not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete exam by ID
 *     tags: [Health Insurance Exams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Exam not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/time-slot-templates:
 *   get:
 *     summary: Get all time slot templates
 *     tags: [Time Slot Templates]
 *     responses:
 *       200:
 *         description: List of time slot templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   time:
 *                     type: string
 *                     description: Time in HH:mm format
 *                   capacity:
 *                     type: integer
 *                     description: Maximum capacity
 *                   is_active:
 *                     type: boolean
 *   post:
 *     summary: Create time slot template
 *     tags: [Time Slot Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['time', 'capacity']
 *             properties:
 *               time:
 *                 type: string
 *                 description: Time in HH:mm format
 *               capacity:
 *                 type: integer
 *                 description: Maximum capacity
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/time-slot-templates/{id}:
 *   delete:
 *     summary: Delete time slot template
 *     tags: [Time Slot Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 */

/**
 * @swagger
 * /api/khoa-kham:
 *   get:
 *     summary: Get all departments with pagination
 *     tags: [Khoa Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/KhoaKham'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create new department
 *     tags: [Khoa Kham]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KhoaKham'
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/khoa-kham/active:
 *   get:
 *     summary: Get all active departments
 *     tags: [Khoa Kham]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KhoaKham'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/khoa-kham/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Khoa Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KhoaKham'
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update department by ID
 *     tags: [Khoa Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KhoaKham'
 *     responses:
 *       200:
 *         description: Department updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KhoaKham'
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete department by ID
 *     tags: [Khoa Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/khoa-kham/{id}/restore:
 *   patch:
 *     summary: Restore deleted department
 *     tags: [Khoa Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Department not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/phong-kham:
 *   get:
 *     summary: Get all clinic rooms with pagination
 *     tags: [Phong Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of clinic rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PhongKham'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create new clinic room
 *     tags: [Phong Kham]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhongKham'
 *     responses:
 *       201:
 *         description: Clinic room created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/phong-kham/active:
 *   get:
 *     summary: Get all active clinic rooms
 *     tags: [Phong Kham]
 *     responses:
 *       200:
 *         description: List of active clinic rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PhongKham'
 */

/**
 * @swagger
 * /api/phong-kham/{id}:
 *   get:
 *     summary: Get clinic room by ID
 *     tags: [Phong Kham]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic room ID
 *     responses:
 *       200:
 *         description: Clinic room found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PhongKham'
 *       404:
 *         description: Clinic room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update clinic room by ID
 *     tags: [Phong Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhongKham'
 *     responses:
 *       200:
 *         description: Clinic room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PhongKham'
 *       404:
 *         description: Clinic room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete clinic room by ID
 *     tags: [Phong Kham]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic room ID
 *     responses:
 *       200:
 *         description: Clinic room deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Clinic room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/phong-kham/{id}/restore:
 *   patch:
 *     summary: Restore deleted clinic room
 *     tags: [Phong Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic room ID
 *     responses:
 *       200:
 *         description: Clinic room restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Clinic room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/loai-kham:
 *   get:
 *     summary: Get all exam types with pagination
 *     tags: [Loai Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of exam types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LoaiKham'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create new exam type
 *     tags: [Loai Kham]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoaiKham'
 *     responses:
 *       201:
 *         description: Exam type created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/loai-kham/active:
 *   get:
 *     summary: Get all active exam types
 *     tags: [Loai Kham]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active exam types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LoaiKham'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/loai-kham/{id}:
 *   get:
 *     summary: Get exam type by ID
 *     tags: [Loai Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam type ID
 *     responses:
 *       200:
 *         description: Exam type found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoaiKham'
 *       404:
 *         description: Exam type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update exam type by ID
 *     tags: [Loai Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoaiKham'
 *     responses:
 *       200:
 *         description: Exam type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoaiKham'
 *       404:
 *         description: Exam type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete exam type by ID
 *     tags: [Loai Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam type ID
 *     responses:
 *       200:
 *         description: Exam type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Exam type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/loai-kham/{id}/restore:
 *   patch:
 *     summary: Restore deleted exam type
 *     tags: [Loai Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam type ID
 *     responses:
 *       200:
 *         description: Exam type restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Exam type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/cong-kham:
 *   get:
 *     summary: Get all exam gates with pagination
 *     tags: [Cong Kham]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of exam gates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CongKham'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *   post:
 *     summary: Create new exam gate
 *     tags: [Cong Kham]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CongKham'
 *     responses:
 *       201:
 *         description: Exam gate created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/cong-kham/active:
 *   get:
 *     summary: Get all active exam gates
 *     tags: [Cong Kham]
 *     responses:
 *       200:
 *         description: List of active exam gates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CongKham'
 */

/**
 * @swagger
 * /api/cong-kham/{id}:
 *   get:
 *     summary: Get exam gate by ID
 *     tags: [Cong Kham]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam gate ID
 *     responses:
 *       200:
 *         description: Exam gate found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CongKham'
 *       404:
 *         description: Exam gate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update exam gate by ID
 *     tags: [Cong Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam gate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CongKham'
 *     responses:
 *       200:
 *         description: Exam gate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CongKham'
 *       404:
 *         description: Exam gate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete exam gate by ID
 *     tags: [Cong Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam gate ID
 *     responses:
 *       200:
 *         description: Exam gate deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Exam gate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/cong-kham/{id}/restore:
 *   patch:
 *     summary: Restore deleted exam gate
 *     tags: [Cong Kham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Exam gate ID
 *     responses:
 *       200:
 *         description: Exam gate restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Exam gate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/clinic-rooms:
 *   get:
 *     summary: Get all clinic room specialties
 *     tags: [Clinic Rooms]
 *     responses:
 *       200:
 *         description: List of clinic room specialties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClinicRoom'
 *   post:
 *     summary: Create new clinic room specialty
 *     tags: [Clinic Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClinicRoom'
 *     responses:
 *       201:
 *         description: Clinic room specialty created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/clinic-rooms/{id}:
 *   get:
 *     summary: Get clinic room specialty by ID
 *     tags: [Clinic Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic room specialty ID
 *     responses:
 *       200:
 *         description: Clinic room specialty found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClinicRoom'
 *       404:
 *         description: Clinic room specialty not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update clinic room specialty by ID
 *     tags: [Clinic Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic room specialty ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClinicRoom'
 *     responses:
 *       200:
 *         description: Clinic room specialty updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClinicRoom'
 *       404:
 *         description: Clinic room specialty not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete clinic room specialty by ID
 *     tags: [Clinic Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clinic room specialty ID
 *     responses:
 *       200:
 *         description: Clinic room specialty deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Clinic room specialty not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/import/khoa-kham:
 *   post:
 *     summary: Import departments from Excel
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file (.xlsx, .xls)
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/import/phong-kham:
 *   post:
 *     summary: Import clinic rooms from Excel
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file (.xlsx, .xls)
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/import/loai-kham:
 *   post:
 *     summary: Import exam types from Excel
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file (.xlsx, .xls)
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/import/cong-kham:
 *   post:
 *     summary: Import exam gates from Excel
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file (.xlsx, .xls)
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/import/bac-si:
 *   post:
 *     summary: Import doctors from Excel
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file (.xlsx, .xls)
 *     responses:
 *       200:
 *         description: Import successful
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/import/khoa-kham/template:
 *   get:
 *     summary: Download department import template
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel template file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /api/import/phong-kham/template:
 *   get:
 *     summary: Download clinic room import template
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel template file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /api/import/loai-kham/template:
 *   get:
 *     summary: Download exam type import template
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel template file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /api/import/cong-kham/template:
 *   get:
 *     summary: Download exam gate import template
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel template file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /api/schedule-slots:
 *   get:
 *     summary: Get all schedule slots
 *     tags: [Schedule Slots]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
 *       - in: query
 *         name: IdPhongKham
 *         schema:
 *           type: string
 *         description: Filter by clinic room ID
 *     responses:
 *       200:
 *         description: List of schedule slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   timeSlot:
 *                     type: string
 *                     description: Time slot in HH:mm format
 *                   IdPhongKham:
 *                     type: string
 *                     description: Clinic room ID
 *                   capacity:
 *                     type: integer
 *                     description: Maximum capacity
 *                   currentCount:
 *                     type: integer
 *                     description: Current booking count
 *                   is_active:
 *                     type: boolean
 *   post:
 *     summary: Create schedule slot
 *     tags: [Schedule Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['date', 'timeSlot', 'IdPhongKham', 'capacity']
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               timeSlot:
 *                 type: string
 *                 description: Time slot in HH:mm format
 *               IdPhongKham:
 *                 type: string
 *                 description: Clinic room ID
 *               capacity:
 *                 type: integer
 *                 description: Maximum capacity
 *     responses:
 *       201:
 *         description: Schedule slot created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/schedule-slots/{id}:
 *   delete:
 *     summary: Delete schedule slot
 *     tags: [Schedule Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Schedule slot ID
 *     responses:
 *       200:
 *         description: Schedule slot deleted successfully
 *       404:
 *         description: Schedule slot not found
 */

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
