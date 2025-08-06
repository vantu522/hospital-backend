import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

import User from './models/user.model.js';
import Doctor from './models/doctor.model.js';
import Service from './models/service.model.js';
import Specialty from './models/specialty.model.js';
import News from './models/news.model.js';
import Introduce from './models/introduce.model.js';
import Recruitment from './models/recruitment.model.js';
import { generateSlug } from './utils/slug.js';

faker.locale = 'en'; 
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

// Helper function để xóa index cũ
async function dropOldIndexes() {
  const collections = [
    { model: News, name: 'News' },
    { model: Introduce, name: 'Introduce' },
    { model: Recruitment, name: 'Recruitment' }
  ];

  for (const { model, name } of collections) {
    try {
      await model.collection.dropIndex('id_1');
      console.log(`✅ Đã xóa index id_1 cũ từ ${name}`);
    } catch (error) {
      console.log(`ℹ️  Index id_1 ${name} không tồn tại hoặc đã được xóa`);
    }
  }
}

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Xóa tất cả index cũ
  await dropOldIndexes();

  // Xóa dữ liệu cũ
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Service.deleteMany({}),
    Specialty.deleteMany({}),
    News.deleteMany({}),
    Introduce.deleteMany({}),
    Recruitment.deleteMany({})
  ]);

  // User - Tạo admin và các user khác
  await User.create([
    {
      name: 'Admin Hospital',
      email: 'admin@hospital.com',
      password: '123456',
      role: 'admin'
    },
    {
      name: 'Bác sĩ Nguyễn Văn Nam',
      email: 'doctor@hospital.com',
      password: '123456',
      role: 'admin'
    },
    {
      name: 'Nguyễn Thị Hoa',
      email: 'user@hospital.com',
      password: '123456',
      role: 'admin'
    },
    {
      name: faker.helpers.arrayElement([
        'Nguyễn Văn Hùng', 'Trần Thị Mai', 'Lê Văn Đức', 
        'Phạm Thị Lan', 'Hoàng Văn Minh', 'Vũ Thị Hoa'
      ]),
      email: faker.internet.email(),
      password: '123456',
      role: 'admin'
    },
    {
      name: faker.helpers.arrayElement([
        'Đỗ Văn Thành', 'Bùi Thị Nga', 'Đinh Văn Tú', 
        'Ngô Thị Linh', 'Đặng Văn Long', 'Lý Thị Thu'
      ]),
      email: faker.internet.email(),
      password: '123456',
      role: 'admin'
    }
  ]);

  // Specialty - Tạo trước để có reference
  const specialtyData = [
    {
      name: 'Tim mạch',
      description: 'Chuyên khoa tim mạch',
      images: [faker.image.url()],
      functions: ['Khám tim', 'Siêu âm tim', 'Điện tâm đồ'],
      slug: generateSlug('Tim mạch'),
      is_active: true
    },
    {
      name: 'Nội khoa',
      description: 'Chuyên khoa nội tổng hợp',
      images: [faker.image.url()],
      functions: ['Khám tổng quát', 'Chẩn đoán', 'Điều trị nội khoa'],
      slug: generateSlug('Nội khoa'),
      is_active: true
    },
    {
      name: 'Ngoại khoa',
      description: 'Chuyên khoa phẫu thuật',
      images: [faker.image.url()],
      functions: ['Phẫu thuật', 'Mổ cấp cứu', 'Phẫu thuật thẩm mỹ'],
      slug: generateSlug('Ngoại khoa'),
      is_active: true
    },
    {
      name: 'Sản phụ khoa',
      description: 'Chuyên khoa sản phụ khoa',
      images: [faker.image.url()],
      functions: ['Khám thai', 'Sinh con', 'Điều trị phụ khoa'],
      slug: generateSlug('Sản phụ khoa'),
      is_active: true
    },
    {
      name: 'Nhi khoa',
      description: 'Chuyên khoa trẻ em',
      images: [faker.image.url()],
      functions: ['Khám trẻ em', 'Tiêm chủng', 'Điều trị bệnh nhi'],
      slug: generateSlug('Nhi khoa'),
      is_active: true
    }
  ];
  
  const specialties = await Specialty.insertMany(specialtyData);

  // Doctor
  const doctors = Array.from({ length: 10 }).map(() => {
    const fullName = faker.person.fullName();
    return {
      full_name: fullName,
      specialties: faker.helpers.arrayElement(specialties).name,
      hospital: 'Bệnh viện Hospital',
      department: faker.commerce.department(),
      degree: faker.person.jobTitle(),
      description: faker.lorem.sentence(),
      experience: [faker.lorem.sentence()],
      certifications: [faker.lorem.word()],
      expertise_fields: [faker.lorem.word()],
      training_process: [faker.lorem.sentence()],
      slug: generateSlug(fullName),
      avatar: faker.image.avatar(),
      phone_number: faker.phone.number(),
      email: faker.internet.email(),
      work_address: faker.location.streetAddress(),
      is_active: true
    };
  });
  await Doctor.insertMany(doctors);

  // Service
  const services = Array.from({ length: 8 }).map(() => {
    const serviceName = faker.commerce.productName();
    return {
      name: serviceName,
      specialties: faker.helpers.arrayElement(specialties).name,
      description: faker.lorem.paragraph(),
      slug: generateSlug(serviceName),
      avatar: faker.image.url(),
      images: [faker.image.url()],
      features: [faker.lorem.words(3)],
      is_active: true
    };
  });
  await Service.insertMany(services);

  // News
  await News.insertMany(
    Array.from({ length: 6 }).map(() => {
      const newsTitle = faker.lorem.sentence();
      return {
        title: newsTitle,
        slug: generateSlug(newsTitle),
        description: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        image: faker.image.url(),
        author: faker.person.fullName(),
        category: faker.helpers.arrayElement(['Warning', 'Health', 'Hospital News']),
        tags: [faker.lorem.word(), faker.lorem.word()],
        publish_date: faker.date.past(),
        is_active: true,
        view_count: faker.number.int({ min: 0, max: 1000 })
      };
    })
  );

  // Introduce
  await Introduce.insertMany(
    Array.from({ length: 2 }).map(() => {
      const introduceTitle = faker.lorem.words(3);
      return {
        title: introduceTitle,
        slug: generateSlug(introduceTitle),
        short_description: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        image: faker.image.url(),
        is_active: true
      };
    })
  );

  // Recruitment - Cập nhật theo schema mới
  await Recruitment.insertMany(
    Array.from({ length: 4 }).map(() => {
      const jobTitle = faker.person.jobTitle();
      return {
        title: jobTitle,
        slug: generateSlug(jobTitle),
        position: faker.person.jobType(),
        specialty_id: faker.helpers.arrayElement(specialties)._id, // Reference đến specialty
        description: faker.lorem.paragraph(),
        requirements: [faker.lorem.sentence(), faker.lorem.sentence()],
        benefits: [faker.lorem.sentence(), faker.lorem.sentence()],
        deadline: faker.date.future(),
        location: faker.location.city(),
        contact_email: faker.internet.email(),
        recruitment_count: faker.number.int({ min: 1, max: 10 }), // Required field
        expiry_date: faker.date.future(), // Required field
        document: null // Optional document path
      };
    })
  );

  console.log('Seed dữ liệu mẫu thành công!');
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});