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

  // Specialty
  const specialties = Array.from({ length: 5 }).map(() => ({
    name: faker.commerce.department(),
    description: faker.lorem.sentence(),
    images: [faker.image.url()],
    functions: [],
    slug: faker.lorem.slug(),
    is_active: true
  }));
  await Specialty.insertMany(specialties);

  // Doctor
  const doctors = Array.from({ length: 10 }).map(() => ({
    full_name: faker.person.fullName(),
    specialties: faker.helpers.arrayElement(specialties).name,
    hospital: 'Bệnh viện Hospital',
    department: faker.commerce.department(),
    degree: faker.person.jobTitle(),
    description: faker.lorem.sentence(),
    experience: [faker.lorem.sentence()],
    certifications: [faker.lorem.word()],
    expertise_fields: [faker.lorem.word()],
    training_process: [faker.lorem.sentence()],
    slug: faker.lorem.slug(),
    avatar: faker.image.avatar(),
    phone_number: faker.phone.number(),
    email: faker.internet.email(),
    work_address: faker.location.streetAddress(),
    is_active: true
  }));
  await Doctor.insertMany(doctors);

  // Service
  const services = Array.from({ length: 8 }).map(() => ({
    name: faker.commerce.productName(),
    specialties: faker.helpers.arrayElement(specialties).name,
    description: faker.lorem.paragraph(),
    slug: faker.lorem.slug(),
    avatar: faker.image.url(),
    images: [faker.image.url()],
    features: [faker.lorem.words(3)],
    is_active: true
  }));
  await Service.insertMany(services);

  // News
  await News.insertMany(
    Array.from({ length: 6 }).map(() => ({
      title: faker.lorem.sentence(),
      slug: faker.lorem.slug(),
      description: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(2),
      image: faker.image.url(),
      author: faker.person.fullName(),
      category: faker.helpers.arrayElement(['Warning', 'Health', 'Hospital News']),
      tags: [faker.lorem.word(), faker.lorem.word()],
      publish_date: faker.date.past(),
      is_active: true,
      view_count: faker.number.int({ min: 0, max: 1000 })
    }))
  );

  // Introduce
  await Introduce.insertMany(
    Array.from({ length: 2 }).map(() => ({
      title: faker.lorem.words(3),
      slug: faker.lorem.slug(),
      short_description: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(2),
      image: faker.image.url(),
      is_active: true
    }))
  );

  // Recruitment
  await Recruitment.insertMany(
    Array.from({ length: 4 }).map(() => ({
      title: faker.person.jobTitle(),
      position: faker.person.jobType(),
      department_id: faker.string.uuid(),
      description: faker.lorem.paragraph(),
      requirements: [faker.lorem.sentence(), faker.lorem.sentence()],
      benefits: [faker.lorem.sentence(), faker.lorem.sentence()],
      deadline: faker.date.future(),
      location: faker.location.city(),
      contact_email: faker.internet.email()
    }))
  );

  console.log('Seed dữ liệu mẫu thành công!');
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});